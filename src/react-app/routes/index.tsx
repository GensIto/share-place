import { createFileRoute } from "@tanstack/react-router";

import { SEARCH_PARAMS } from "@/react-app/constants";
import { createStandardSchemaV1 } from "nuqs";
import { SearchHeader } from "@/react-app/components/SearchHeader";
import { Toaster } from "sonner";
import { Spinner } from "@/components/ui/spinner";
import { PlaceCard } from "@/react-app/components/PlaceCard";

export const Route = createFileRoute("/")({
  beforeLoad: async () => {
    // 匿名認証も許可するため、認証チェックは行わない
    // 必要に応じて、特定の機能で認証を要求する場合は個別のルートでチェック
  },
  component: Index,
  validateSearch: createStandardSchemaV1(SEARCH_PARAMS, {
    partialOutput: true,
  }),
});

function Index() {
  return (
    <div className='min-h-screen bg-gray-800 flex flex-col'>
      <SearchHeader>
        {({ result, isPending }) => (
          <div className='flex-1 flex items-center justify-center'>
            <Toaster />
            {isPending && (
              <div className='flex justify-center items-center h-96'>
                <Spinner className='size-10 text-white' />
              </div>
            )}
            {!isPending && result && result.places.length > 0 && (
              <div className='w-full px-4 mt-8'>
                <PlaceCard place={result.places[0]} />
              </div>
            )}
            {!isPending && result && result.places.length === 0 && (
              <div className='flex justify-center items-center h-96'>
                <p className='text-gray-400'>検索結果が見つかりませんでした</p>
              </div>
            )}
          </div>
        )}
      </SearchHeader>
    </div>
  );
}
