import AnnouncementBar from "@/components/home/AnnouncementBar";
import EditorialHero, { type EditorialHeroLook } from "@/components/home/EditorialHero";
import HomeFeed, { type FeedLook } from "@/components/home/HomeFeed";

export default function HomeView({ heroLooks, looks }: { heroLooks: EditorialHeroLook[]; looks: FeedLook[] }) {
  return (
    <main>
      <AnnouncementBar />
      <EditorialHero looks={heroLooks} />
      <HomeFeed looks={looks} />
    </main>
  );
}
