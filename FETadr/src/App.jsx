import { Layout, Menu, Typography } from "antd"
import { useEffect, useState } from "react"
import { HomePage } from "./pages/HomePage"
import { LetterPage } from "./pages/LetterPage"
import { ListeningPage } from "./pages/ListeningPage"
import { MockPage } from "./pages/MockPage"
import { PlanPage } from "./pages/PlanPage"
import { ReadingPage } from "./pages/ReadingPage"
import { SpeakingPage } from "./pages/SpeakingPage"
import { WritingPage } from "./pages/WritingPage"

const { Header, Content, Footer, Sider } = Layout

const items = [
  { key: "home", label: "Tổng quan" },
  { key: "listening", label: "Nghe" },
  { key: "reading", label: "Đọc" },
  { key: "writing", label: "Viết lại câu" },
  { key: "letter", label: "Viết thư" },
  { key: "speaking", label: "Nói" },
  { key: "mock", label: "Thi thử" },
  { key: "plan", label: "Plan chấm điểm" },
]

const homeTargets = {
  Nghe: "listening",
  Đọc: "reading",
  Viết: "writing",
  Nói: "speaking",
}

const pageKeys = new Set(items.map((item) => item.key))

function pageFromPath() {
  const name = window.location.pathname.replace(/^\/+|\/+$/g, "")
  if (!name) return "home"
  return pageKeys.has(name) ? name : "home"
}

function pathFor(key) {
  return key === "home" ? "/" : `/${key}`
}

export default function App() {
  const [page, setPage] = useState(pageFromPath)

  function openPage(next) {
    const key = pageKeys.has(next) ? next : "home"
    const path = pathFor(key)
    if (window.location.pathname !== path) {
      window.history.pushState(null, "", path)
    }
    setPage(key)
  }

  useEffect(() => {
    function onPopState() {
      setPage(pageFromPath())
    }
    window.addEventListener("popstate", onPopState)
    return () => window.removeEventListener("popstate", onPopState)
  }, [])

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Sider breakpoint="lg" collapsedWidth={0} theme="light" width={220}>
        <Typography.Title level={4} style={{ margin: 16 }}>
          TLU English B1
        </Typography.Title>
        <Menu
          mode="inline"
          selectedKeys={[page]}
          items={items}
          onClick={({ key }) => openPage(key)}
        />
      </Sider>
      <Layout>
        <Header className="site-header">
          <div>
            <div className="site-header-title">Ôn thi tiếng Anh đầu ra B1</div>
            <div className="site-header-sub">Đại học Thủy Lợi · Đề cương 2022</div>
          </div>
        </Header>
        <Content style={{ margin: 16 }}>
          <div style={{ background: "#fff", padding: 20, borderRadius: 12, minHeight: "calc(100vh - 220px)" }}>
            {page === "home" && <HomePage onOpen={(title) => openPage(homeTargets[title] ?? "home")} />}
            {page === "listening" && <ListeningPage />}
            {page === "reading" && <ReadingPage />}
            {page === "writing" && <WritingPage />}
            {page === "letter" && <LetterPage />}
            {page === "speaking" && <SpeakingPage onOpenPlan={() => openPage("plan")} />}
            {page === "mock" && <MockPage />}
            {page === "plan" && <PlanPage />}
          </div>
        </Content>
        <Footer className="site-footer">
          <div className="site-footer-title">Đại học Thủy Lợi</div>
          <div>Ôn thi tiếng Anh đầu ra B1 · Nghe, đọc, viết lại câu, viết thư, nói và thi thử.</div>
        </Footer>
      </Layout>
    </Layout>
  )
}
