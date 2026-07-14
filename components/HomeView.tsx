import AnnouncementBar from "@/components/home/AnnouncementBar";
import EditorialHero, { type EditorialHeroLook } from "@/components/home/EditorialHero";
import HomeFeed, { type FeedLook } from "@/components/home/HomeFeed";

export default function HomeView({ heroLook, looks }: { heroLook: EditorialHeroLook; looks: FeedLook[] }) {
  return (
    <main>
      <AnnouncementBar />
      <EditorialHero look={heroLook} />
      <HomeFeed looks={looks} />
    </main>
  );
}
