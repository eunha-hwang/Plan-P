"use client";

import Script from "next/script";
import { useEffect, useRef, useState } from "react";
import { clsx } from "@/lib/clsx";
import { Input } from "@/components/ui";
import { t } from "@/lib/i18n";
import { useStore } from "@/store/useStore";

declare global {
  interface Window {
    kakao: any;
  }
}

export interface DestinationValue {
  address: string;
  lat?: number;
  lng?: number;
}

interface KakaoPlace {
  id: string;
  place_name: string;
  road_address_name: string;
  address_name: string;
  x: string;
  y: string;
}

const KAKAO_JS_KEY = process.env.NEXT_PUBLIC_KAKAO_JS_KEY;

export function DestinationPicker({
  value,
  onChange,
}: {
  value: DestinationValue;
  onChange: (v: DestinationValue) => void;
}) {
  const lang = useStore((s) => s.language);
  const [query, setQuery] = useState(value.address);
  const [results, setResults] = useState<KakaoPlace[]>([]);
  const [sdkReady, setSdkReady] = useState(false);

  const mapElRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // 수정 모드 등 value가 외부에서 바뀌면 검색창 텍스트도 맞춘다
  useEffect(() => {
    setQuery(value.address);
  }, [value.address]);

  // SDK 스크립트가 이전 페이지 방문 때 이미 로드돼 있으면 next/script의 onLoad가
  // 다시 안 불릴 수 있으니, 마운트 시점에 이미 로드돼 있는지 직접 확인한다
  useEffect(() => {
    if (window.kakao?.maps?.load) {
      window.kakao.maps.load(() => setSdkReady(true));
    }
  }, []);

  // SDK가 늦게 로드되면 이미 debounce가 지나간 검색이 조용히 무시된 채 끝날 수 있으니,
  // SDK 준비 완료 시점에 현재 입력값으로 한 번 더 검색해준다
  useEffect(() => {
    if (sdkReady) runSearch(query);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sdkReady]);

  // 좌표가 있으면(검색 결과 선택) 지도에 핀을 찍는다
  useEffect(() => {
    if (!sdkReady || value.lat == null || value.lng == null || !mapElRef.current) return;
    const center = new window.kakao.maps.LatLng(value.lat, value.lng);
    if (!mapRef.current) {
      mapRef.current = new window.kakao.maps.Map(mapElRef.current, { center, level: 3 });
    } else {
      mapRef.current.setCenter(center);
    }
    if (markerRef.current) markerRef.current.setMap(null);
    markerRef.current = new window.kakao.maps.Marker({ position: center, map: mapRef.current });
  }, [sdkReady, value.lat, value.lng]);

  const runSearch = (q: string) => {
    if (!sdkReady || !window.kakao?.maps?.services || !q.trim()) {
      setResults([]);
      return;
    }
    const places = new window.kakao.maps.services.Places();
    places.keywordSearch(q, (data: KakaoPlace[], status: string) => {
      setResults(status === window.kakao.maps.services.Status.OK ? data.slice(0, 5) : []);
    });
  };

  const handleInput = (q: string) => {
    setQuery(q);
    // 텍스트를 직접 고치면 이전에 찍었던 핀은 더 이상 유효하지 않으니 비운다
    onChange({ address: q });
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => runSearch(q), 300);
  };

  const pick = (place: KakaoPlace) => {
    setQuery(place.place_name);
    setResults([]);
    onChange({
      address: place.place_name,
      lat: parseFloat(place.y),
      lng: parseFloat(place.x),
    });
  };

  return (
    <div>
      {KAKAO_JS_KEY && (
        <Script
          src={`//dapi.kakao.com/v2/maps/sdk.js?appkey=${KAKAO_JS_KEY}&libraries=services&autoload=false`}
          strategy="afterInteractive"
          onLoad={() => window.kakao.maps.load(() => setSdkReady(true))}
        />
      )}

      <Input
        value={query}
        onChange={(e) => handleInput(e.target.value)}
        placeholder={t(lang, "destination.placeholder")}
        maxLength={40}
        autoComplete="off"
      />

      {results.length > 0 && (
        <div className="mt-1 overflow-hidden rounded-2xl border border-border bg-surface">
          {results.map((r) => (
            <button
              key={r.id}
              type="button"
              onClick={() => pick(r)}
              className="block w-full border-b border-border px-4 py-2.5 text-left last:border-b-0 hover:bg-surface-2"
            >
              <p className="truncate text-sm font-semibold text-fg">{r.place_name}</p>
              <p className="truncate text-xs text-muted">
                {r.road_address_name || r.address_name}
              </p>
            </button>
          ))}
        </div>
      )}

      <div
        ref={mapElRef}
        className={clsx(
          "mt-2 w-full overflow-hidden rounded-2xl border-border transition-all",
          value.lat != null && value.lng != null ? "h-40 border" : "h-0 border-0"
        )}
      />

      {!KAKAO_JS_KEY && (
        <p className="mt-1.5 text-xs text-urgent">
          {t(lang, "destination.kakaoMissing")}
        </p>
      )}
    </div>
  );
}
