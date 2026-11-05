import { getAllPosts } from "@/lib/posts";
import { getHome, getProjects } from "@/lib/home";
import { HomeClient } from "./HomeClient";

// 首頁的互動很多，主體是 client component；這一層 server component
// 只負責在建置期把內容讀進來傳下去：
//   content/home.md        首頁段落與區塊
//   content/projects/*.md  專案
//   content/blog/*.md      文章
export default function Home() {
  return <HomeClient home={getHome()} projects={getProjects()} posts={getAllPosts()} />;
}
