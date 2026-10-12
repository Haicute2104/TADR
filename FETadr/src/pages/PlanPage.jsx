import { Card, Typography } from "antd"

const { Paragraph, Title } = Typography

export function PlanPage() {
  return (
    <div>
      <Title level={3} style={{ marginTop: 0 }}>Plan chấm nói và viết thư bằng model</Title>
      <Paragraph>
        Viết lại câu giữ cách chấm luật (so khớp nhiều đáp án). Thư và nói gọi Groq từ Express: thư chấm thẳng bài viết, nói chuyển giọng thành chữ rồi chấm theo rubric.
      </Paragraph>

      <Card title="1. Vì sao tách riêng" style={{ marginBottom: 16 }}>
        <Paragraph>
          Đề cương chấm thư theo độ dài 80–100 từ, bám chủ đề, bố cục thư và ngôn ngữ bậc 3. Nói chấm 3 phần: thông tin cá nhân 6 điểm, trình bày chủ đề 8 điểm, trả lời hỏi thêm 6 điểm. Không có một đáp án duy nhất, nên so chuỗi như trắc nghiệm sẽ chấm sai bài diễn đạt tốt.
        </Paragraph>
      </Card>

      <Card title="2. API dự kiến trên Express" style={{ marginBottom: 16 }}>
        <Paragraph>POST /api/score/letter</Paragraph>
        <Paragraph code>
          {`{ "topicId": "holiday", "prompt": "...", "text": "...", "wordCount": 92 }`}
        </Paragraph>
        <Paragraph>POST /api/score/speaking</Paragraph>
        <Paragraph code>
          {`{ "part": 2, "topicId": "tech", "transcript": "...", "followUps": [{ "question": "...", "transcript": "..." }] }`}
        </Paragraph>
        <Paragraph>
          Server giữ rubric trong code, gửi transcript hoặc bài viết kèm rubric cho model, nhận JSON điểm từng tiêu chí. Không để model tự bịa thang điểm ngoài 6 / 8 / 6 và 20.
        </Paragraph>
      </Card>

      <Card title="3. Rubric thư (20 điểm)" style={{ marginBottom: 16 }}>
        <ul>
          <li>Nhiệm vụ và độ dài, 5 điểm: đủ ý đề yêu cầu, khoảng 80–100 từ, đúng dạng thư hoặc email.</li>
          <li>Bố cục, 4 điểm: lời chào, mở bài, thân bài, kết thư.</li>
          <li>Ngữ pháp và chính tả, 6 điểm: thì, câu điều kiện, liên từ mức B1. Lỗi nhỏ không trừ sạch điểm nếu ý vẫn rõ.</li>
          <li>Từ vựng theo chủ đề, 5 điểm: leisure, sports, travel, food, clothes, technology, people, places.</li>
        </ul>
        <Paragraph>
          Trả về điểm từng mục, tổng, và 3 góp ý cụ thể (một câu nên sửa, một từ nên thay, một ý còn thiếu). Nếu dưới 70 từ hoặc lạc đề, trần nhiệm vụ là 2/5.
        </Paragraph>
      </Card>

      <Card title="4. Rubric nói (20 điểm)" style={{ marginBottom: 16 }}>
        <ul>
          <li>Phần 1, tối đa 6: trả lời đủ câu về tên, quê, chỗ ở, việc học, sở thích, dự định. Mỗi câu bỏ trống trừ khoảng 1 điểm.</li>
          <li>Phần 2, tối đa 8: đúng chủ đề, có chi tiết (ai, khi nào, ở đâu, vì sao), nói liền khoảng một phút.</li>
          <li>Phần 3, tối đa 6: trả lời được câu hỏi thêm, có lý do, không chỉ yes/no.</li>
        </ul>
        <Paragraph>
          Trong mỗi phần, model chấm bốn trục rồi quy về điểm phần: hoàn thành nhiệm vụ, ngữ pháp, từ vựng, độ mạch lạc. Phát âm chỉ chấm khi có file audio: thêm bước speech-to-text, gửi cả transcript lẫn nhận xét độ rõ nếu API hỗ trợ audio. Bản đầu chỉ cần học sinh gõ hoặc dán transcript.
        </Paragraph>
      </Card>

      <Card title="5. Prompt khung" style={{ marginBottom: 16 }}>
        <Paragraph>
          System: bạn là giám khảo chuẩn đầu ra tiếng Anh B1 của Đại học Thủy Lợi. Chỉ dùng rubric được gửi. Không thêm tiêu chí. Điểm là số nguyên hoặc bội 0,5 trong trần từng mục. Nếu bài thiếu ý, ghi rõ ý nào thiếu.
        </Paragraph>
        <Paragraph>
          User gồm đề, bài làm và rubric. Model trả về đúng các trường criteria (name, score, max, comment), total và advice. Server kiểm tra tổng từng mục không vượt trần trước khi trả về giao diện.
        </Paragraph>
      </Card>

      <Card title="6. Model và cách gọi" style={{ marginBottom: 16 }}>
        <ul>
          <li>Ưu tiên một model giỏi làm theo rubric và xuất JSON, gọi từ Express để không lộ API key trên trình duyệt.</li>
          <li>Biến môi trường SCORE_API_KEY và SCORE_MODEL. Hết key hoặc lỗi mạng thì trả 503, giao diện giữ bài làm và báo chưa chấm được.</li>
          <li>Lưu mỗi lần chấm: đề, bài, điểm, thời điểm. Không dùng bài của sinh viên để tự huấn luyện.</li>
          <li>Với 30–50 bài mẫu đã có điểm giáo viên, so lệch trung bình. Nếu lệch hơn 3 điểm trên thư hoặc hơn 2 điểm trên nói, siết prompt hoặc đổi model trước khi bật cho cả lớp.</li>
        </ul>
      </Card>

      <Card title="7. Thứ tự làm">
        <ol>
          <li>Chốt rubric với giáo viên bộ môn, nhất là trần điểm khi bài ngắn hoặc lạc đề.</li>
          <li>Thêm hai route Express và nút “Nhờ chấm” ở trang thư và trang nói.</li>
          <li>Chấm thử trên bài mẫu sẵn có trong thư mục S và các thư viết tay.</li>
          <li>Sau khi lệch điểm chấp nhận được, cộng điểm thư vào kết quả thi thử. Nói vẫn là vòng riêng vì đề chính thức là phỏng vấn.</li>
        </ol>
      </Card>
    </div>
  )
}
