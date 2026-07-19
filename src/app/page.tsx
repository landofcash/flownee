import { HomeShell } from "@/components/home/home-shell";
import { getHomeStateForDemo } from "@/lib/home-state";

type HomePageProps = {
  searchParams: Promise<{ demo?: string }>;
};

export default async function Home({ searchParams }: HomePageProps) {
  const { demo } = await searchParams;

  return (
    <HomeShell
      state={getHomeStateForDemo(demo)}
      useLocalData={demo === undefined}
    />
  );
}
