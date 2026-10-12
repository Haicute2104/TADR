import { Button, Card, Col, Row, Statistic, Typography } from "antd"

const { Paragraph, Title, Text } = Typography

const sections = [
  { title: "Nghe", score: "20 điểm", time: "15 phút", detail: "5 câu chọn tranh (1,5đ), 5 câu nối (1,25đ), 5 câu trắc nghiệm (1,25đ)." },
  { title: "Đọc", score: "30 điểm", time: "30 phút", detail: "10 câu ngữ pháp–từ vựng, 5 biển báo, 5 câu đọc hiểu, 10 câu điền từ. Mỗi câu 1 điểm." },
  { title: "Viết", score: "30 điểm", time: "30 phút", detail: "5 câu viết lại (2đ/câu) và 1 thư 80–100 từ (20đ)." },
  { title: "Nói", score: "20 điểm", time: "8–10 phút", detail: "Giới thiệu bản thân 6đ, nói theo chủ đề 8đ, hỏi thêm 6đ." },
]

export function HomePage({ onOpen }) {
  return (
    <div>
      <Title level={2} style={{ marginTop: 0 }}>
        Ôn chuẩn đầu ra tiếng Anh B1
      </Title>
      <Paragraph>
        Bám đề cương Bộ môn Tiếng Anh, Trường Đại học Thủy Lợi (2022). Phần thi viết gồm nghe, đọc và viết trong 75 phút, tổng 80 điểm. Phần nói 20 điểm, thi phỏng vấn riêng.
      </Paragraph>
      <Row gutter={[16, 16]}>
        {sections.map((section) => (
          <Col xs={24} md={12} key={section.title}>
            <Card title={section.title} extra={<Button type="link" onClick={() => onOpen(section.title)}>{section.time}</Button>}>
              <Statistic title="Thang điểm" value={section.score} />
              <Text type="secondary">{section.detail}</Text>
            </Card>
          </Col>
        ))}
      </Row>
      <Card style={{ marginTop: 16 }} title="Phần đang chấm tự động">
        <Paragraph>
          Trắc nghiệm ngữ pháp, biển báo, viết lại câu và nghe được chấm theo đáp án. Bấm Kiểm tra đáp án ở phần nghe để xem chữ đúng. Thư và nói lưu bài làm, chưa gọi model chấm điểm.
        </Paragraph>
        <Paragraph type="secondary">
          Ngân hàng hiện có chưa gồm bài đọc dài (Reading phần 3) và bài điền từ (Reading phần 4), nên đề thi thử ghi rõ phần còn thiếu thay vì bịa câu.
        </Paragraph>
      </Card>
    </div>
  )
}
