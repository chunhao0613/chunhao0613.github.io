import { getAllPosts } from "@/lib/posts";
import { HomeClient } from "./HomeClient";

// 首頁的互動很多，主體是 client component；這一層 server component
// 只負責在建置期把文章列表讀進來傳下去。
export default function Home() {
  const posts = getAllPosts();
  return <HomeClient posts={posts} />;
}
