import type { Metadata } from "next";

// 이 컴퓨터의 LAN 주소. IP가 바뀌면 이 값과 public/connect-qr.png 를 함께 갱신하세요.
const LAN_URL = "http://192.168.45.95:3000";

export const metadata: Metadata = {
  title: "Plan P · 핸드폰에서 열기",
};

export default function ConnectPage() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center px-6 py-12">
      <div className="w-full max-w-[360px] text-center">
        <h1 className="text-2xl font-bold text-fg">핸드폰에서 열어보기</h1>
        <p className="mt-2 text-sm leading-relaxed text-muted">
          컴퓨터와 <b className="text-fg">같은 Wi-Fi</b>에 연결한 폰으로
          <br />
          아래 QR을 스캔하세요.
        </p>

        <div className="card-elev mx-auto mt-8 w-fit rounded-3xl border border-border bg-surface p-5">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/connect-qr.png"
            alt="접속 QR 코드"
            width={220}
            height={220}
            className="h-[220px] w-[220px]"
          />
        </div>

        <div className="mt-6">
          <p className="text-xs font-semibold text-muted">직접 주소 입력</p>
          <p className="mt-1 select-all text-base font-semibold text-brand">
            {LAN_URL}
          </p>
        </div>

        <ol className="mx-auto mt-8 max-w-[280px] space-y-2 text-left text-sm text-muted">
          <li>1. 폰을 컴퓨터와 같은 Wi-Fi에 연결</li>
          <li>2. 기본 카메라로 QR 스캔 (또는 위 주소 입력)</li>
          <li>3. 열리는 화면이 실제 폰에서의 모습이에요</li>
        </ol>

        <p className="mt-8 text-xs leading-relaxed text-muted/80">
          안 열리면 컴퓨터 방화벽이 3000 포트를 막고 있을 수 있어요. 회사·카페 등
          기기 간 통신이 차단된 Wi-Fi에서도 접속이 안 될 수 있습니다.
        </p>
      </div>
    </div>
  );
}
