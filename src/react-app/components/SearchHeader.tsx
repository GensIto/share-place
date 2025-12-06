import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { PLACE_TYPES, SEARCH_PARAMS } from "@/react-app/constants";
import { useQueryStates } from "nuqs";
import { cn } from "@/lib/utils";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { getCurrentLocation, searchPlacesNearby } from "@/react-app/functions";
import { Button } from "@/components/ui/button";
import { SearchIcon } from "lucide-react";
import { ReactNode } from "react";
import { SearchPlacesNearbyOutput } from "@/worker/usecase/places/SearchPlacesNearbyUseCase";

interface SearchHeaderProps {
  children?: (props: {
    result: SearchPlacesNearbyOutput | null;
    isPending: boolean;
  }) => ReactNode;
}

export const SearchHeader = ({ children }: SearchHeaderProps) => {
  const [{ searchMode, prompt, keyword, type }, setSearchParams] =
    useQueryStates(SEARCH_PARAMS);
  const [isPending, startTransition] = useTransition();

  const [result, setResult] = useState<SearchPlacesNearbyOutput | null>(null);

  const handleSearch = async (overrideType?: string) => {
    startTransition(async () => {
      try {
        // 位置情報の許可を求めて取得
        const coords = await getCurrentLocation();

        // 位置情報を取得できたら検索を実行
        try {
          const result = await searchPlacesNearby({
            latitude: coords.latitude,
            longitude: coords.longitude,
            type: searchMode === "type" ? (overrideType ?? type) : undefined,
            keyword:
              searchMode === "ai" || searchMode === "text"
                ? prompt || undefined
                : undefined,
            limit: 5,
          });

          // エラーレスポンスの場合はスキップ
          if ("error" in result) {
            toast.error(result.message || "検索に失敗しました。");
            return;
          }

          setResult(result);
        } catch (searchError) {
          console.error("検索に失敗しました:", searchError);
          toast.error("検索に失敗しました。もう一度お試しください。");
        }
      } catch (error) {
        console.error("位置情報の取得に失敗しました:", error);
        toast.error("位置情報の取得に失敗しました。もう一度お試しください。");
      }
    });
  };

  return (
    <div>
      <Tabs defaultValue={searchMode} className='w-full max-w-md mx-auto'>
        <TabsList className='w-full bg-gray-800'>
          <TabsTrigger
            value='ai'
            className='w-full disabled:bg-gray-100 group'
            disabled={searchMode === "ai"}
            onClick={() => setSearchParams({ searchMode: "ai" })}
          >
            <span className='text-white group-disabled:text-gray-800'>AI</span>
          </TabsTrigger>
          <TabsTrigger
            value='text'
            className='w-full group disabled:bg-gray-100'
            disabled={searchMode === "text"}
            onClick={() => setSearchParams({ searchMode: "text" })}
          >
            <span className='text-white group-disabled:text-gray-800'>
              Text
            </span>
          </TabsTrigger>
          <TabsTrigger
            value='type'
            className='w-full group disabled:bg-gray-100'
            disabled={searchMode === "type"}
            onClick={() => setSearchParams({ searchMode: "type" })}
          >
            <span className='text-white group-disabled:text-gray-800'>
              Type
            </span>
          </TabsTrigger>
        </TabsList>
        <TabsContent value='ai'>
          <div className='flex'>
            <Input
              placeholder='Search'
              value={prompt}
              onChange={(e) => setSearchParams({ prompt: e.target.value })}
              className='rounded-r-none'
            />
            <Button onClick={() => alert("AI")}>
              <span className='sr-only'>Search</span>
              <SearchIcon className='size-4' />
            </Button>
          </div>
        </TabsContent>
        <TabsContent value='text'>
          <div className='flex'>
            <Input
              placeholder='Search'
              value={keyword}
              onChange={(e) => setSearchParams({ keyword: e.target.value })}
              className='rounded-r-none'
            />
            <Button onClick={() => handleSearch()}>
              <span className='sr-only'>Search</span>
              <SearchIcon className='size-4' />
            </Button>
          </div>
        </TabsContent>
        <TabsContent value='type'>
          <div className='overflow-x-auto mx-4 scrollbar-hide'>
            <div className='flex gap-2 min-w-max'>
              {PLACE_TYPES.map((placeType) => (
                <button
                  key={placeType.value}
                  onClick={async () => {
                    await setSearchParams({ type: placeType.value });
                    await handleSearch(placeType.value);
                  }}
                  className={cn(
                    "w-16 h-16 rounded-full flex items-center justify-center transition-all shrink-0",
                    type === placeType.value
                      ? "bg-pink-50 text-white shadow-sm"
                      : "bg-gray-700 text-gray-400 hover:bg-gray-600 hover:text-gray-300"
                  )}
                  title={placeType.label}
                >
                  <span className='text-xl'>{placeType.emoji}</span>
                </button>
              ))}
            </div>
          </div>
        </TabsContent>
      </Tabs>
      {children?.({ result, isPending })}
    </div>
  );
};
