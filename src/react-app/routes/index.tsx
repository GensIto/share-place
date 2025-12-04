import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  beforeLoad: async () => {
    // 匿名認証も許可するため、認証チェックは行わない
    // 必要に応じて、特定の機能で認証を要求する場合は個別のルートでチェック
  },
  component: Index,
});

function Index() {
  return (
    <div className='space-y-4'>
      <h1 className='text-2xl font-bold'>Share Place</h1>
      <p>場所を共有するアプリケーション</p>
    </div>
  );
}
