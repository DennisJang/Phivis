const fs = require('fs');
const path = require('path');
const LOCALES_DIR = path.join(__dirname, 'src', 'i18n', 'locales');

const first30Keys = {
  ko: {
    "title": "첫 30일",
    "subtitle": "순서를 알면 두렵지 않다",
    "loading": "로딩 중...",
    "disclaimer": "이 가이드는 일반적인 안내이며, 개인 상황에 따라 다를 수 있습니다.",
    "emergency": "응급 상황 119",
    "documents": "준비물",
    "recommendedBank": "추천 은행",
    "recommendedPhone": "추천 요금제",
    "markDone": "완료",
    "skip": "건너뛰기",
    "waiting": "약 {{days}}일 소요",
    "layer": {
      "land": { "title": "🛬 발 딛기", "subtitle": "물리적으로 한국에 존재하기" },
      "identity": { "title": "🪪 나를 증명하기", "subtitle": "법적으로 존재하기" },
      "connect": { "title": "🔗 세상과 연결되기", "subtitle": "디지털로 존재하기" },
      "protect": { "title": "🛡️ 안전망 확보", "subtitle": "제도적으로 보호받기" },
      "settle": { "title": "🌱 뿌리내리기", "subtitle": "Phivis로 더 깊게" }
    },
    "step": {
      "airport_arrival": { "title": "공항 도착", "desc": "입국 심사 후 공항에서 해야 할 일", "emotion": "드디어 도착했어요! 긴장되지만, 한 단계씩 해나가면 됩니다." },
      "temp_housing": { "title": "임시 숙소 확보", "desc": "첫날 머물 곳 확인" },
      "prepaid_sim": { "title": "선불 SIM 구매", "desc": "공항 편의점이나 통신사 부스에서 구매" },
      "arc_apply": { "title": "외국인등록증(ARC) 신청", "desc": "입국 90일 이내 출입국사무소에서 신청", "caution": "90일 이내 미신청 시 과태료", "emotion": "가장 중요한 단계예요. 이것만 하면 나머지가 열립니다." },
      "arc_waiting": { "title": "ARC 수령 대기", "desc": "신청 후 2~4주 소요. 이 기간에 미리 준비할 수 있는 것들이 있어요.", "emotion": "답답하죠? 정상입니다. 한국은 ARC 없이는 정말 많은 게 안 됩니다. 하지만 이 기간에 미리 준비하면, ARC 받는 날 바로 다음 단계로 넘어갈 수 있어요." },
      "arc_received": { "title": "ARC 수령 완료", "desc": "출입국사무소에서 수령. 이제 은행, 폰, 보험이 가능해집니다!", "emotion": "축하합니다! 이제 한국에서 본격적으로 생활할 수 있어요." },
      "bank_open": { "title": "은행 계좌 개설", "desc": "ARC + 여권으로 계좌 개설", "caution": "외국인 전담 창구가 있는 지점을 방문하세요", "emotion": "거절당할 수 있어요. 정상입니다. 다른 지점을 시도해보세요." },
      "postpaid_phone": { "title": "후불 폰 전환", "desc": "ARC + 은행계좌로 후불 요금제 가입 가능" },
      "essential_apps": { "title": "필수 앱 설치", "desc": "KakaoTalk, Naver Map, Papago, T-money" },
      "health_insurance": { "title": "건강보험 확인", "desc": "비자에 따라 가입 방식이 다릅니다", "caution": "미가입 시 비자 연장 심사에 영향" },
      "four_insurances": { "title": "4대보험 확인", "desc": "국민연금, 건강보험, 고용보험, 산재보험" },
      "address_register": { "title": "전입신고", "desc": "이사 후 14일 이내 주민센터에서 신고", "caution": "14일 이내 미신고 시 과태료", "emotion": "집 계약서를 가져가세요. 확정일자도 같이 받으면 보증금이 보호됩니다." },
      "first_payslip": { "title": "첫 급여명세서 확인", "desc": "Scan으로 급여명세서를 찍어보세요" },
      "housing_stable": { "title": "주거 안정", "desc": "계약서 확인은 서류 정리에서" },
      "phivis_score": { "title": "Phivis Score 확인", "desc": "체류 안정성을 한눈에", "emotion": "한 달이 됐어요. 처음과 비교하면 얼마나 많은 걸 해냈는지 보세요." }
    }
  },
  en: {
    "title": "First 30 Days",
    "subtitle": "Know the order, lose the fear",
    "loading": "Loading...",
    "disclaimer": "This guide is general information and may vary by individual circumstances.",
    "emergency": "Emergency 119",
    "documents": "What you need",
    "recommendedBank": "Recommended bank",
    "recommendedPhone": "Recommended plan",
    "markDone": "Done",
    "skip": "Skip",
    "waiting": "~{{days}} days",
    "layer": {
      "land": { "title": "🛬 Land", "subtitle": "Physically be in Korea" },
      "identity": { "title": "🪪 Identity", "subtitle": "Legally exist" },
      "connect": { "title": "🔗 Connect", "subtitle": "Digitally exist" },
      "protect": { "title": "🛡️ Protect", "subtitle": "Be institutionally protected" },
      "settle": { "title": "🌱 Settle", "subtitle": "Go deeper with Phivis" }
    },
    "step": {
      "airport_arrival": { "title": "Airport arrival", "desc": "What to do after immigration", "emotion": "You made it! Take it one step at a time." },
      "temp_housing": { "title": "Temporary housing", "desc": "Secure your first night" },
      "prepaid_sim": { "title": "Prepaid SIM", "desc": "Buy at airport convenience store or carrier booth" },
      "arc_apply": { "title": "Apply for ARC", "desc": "Apply at immigration within 90 days of arrival", "caution": "Fine if not applied within 90 days", "emotion": "This is the most important step. Once done, everything else unlocks." },
      "arc_waiting": { "title": "Waiting for ARC", "desc": "2-4 weeks after application. There are things you can prepare during this time.", "emotion": "Frustrating? That's normal. Korea requires ARC for almost everything. But if you prepare now, you can jump to the next step the day you get it." },
      "arc_received": { "title": "ARC received", "desc": "Pick up at immigration. Now bank, phone, insurance are possible!", "emotion": "Congratulations! You can now fully participate in Korean life." },
      "bank_open": { "title": "Open bank account", "desc": "ARC + passport to open an account", "caution": "Visit a branch with a foreign customer desk", "emotion": "You might get rejected. That's normal. Try a different branch." },
      "postpaid_phone": { "title": "Postpaid phone plan", "desc": "ARC + bank account needed for postpaid" },
      "essential_apps": { "title": "Essential apps", "desc": "KakaoTalk, Naver Map, Papago, T-money" },
      "health_insurance": { "title": "Health insurance", "desc": "Enrollment method varies by visa type", "caution": "Non-enrollment may affect visa renewal" },
      "four_insurances": { "title": "4 major insurances", "desc": "National pension, health, employment, industrial accident" },
      "address_register": { "title": "Address registration", "desc": "Report at community center within 14 days of moving", "caution": "Fine if not reported within 14 days", "emotion": "Bring your lease contract. Get a confirmed date stamp to protect your deposit." },
      "first_payslip": { "title": "Check first payslip", "desc": "Scan your payslip with Phivis Scan" },
      "housing_stable": { "title": "Housing stability", "desc": "Check your contract in Documents" },
      "phivis_score": { "title": "Check Phivis Score", "desc": "See your settlement stability at a glance", "emotion": "It's been a month. Look how far you've come." }
    }
  },
  vi: {
    "title": "30 Ngày Đầu",
    "subtitle": "Biết thứ tự, hết lo sợ",
    "loading": "Đang tải...",
    "disclaimer": "Hướng dẫn này mang tính chất tham khảo và có thể khác nhau tùy theo hoàn cảnh cá nhân.",
    "emergency": "Khẩn cấp 119",
    "documents": "Cần chuẩn bị",
    "recommendedBank": "Ngân hàng đề xuất",
    "recommendedPhone": "Gói cước đề xuất",
    "markDone": "Hoàn thành",
    "skip": "Bỏ qua",
    "waiting": "~{{days}} ngày",
    "layer": {
      "land": { "title": "🛬 Đặt chân", "subtitle": "Có mặt tại Hàn Quốc" },
      "identity": { "title": "🪪 Chứng minh", "subtitle": "Tồn tại hợp pháp" },
      "connect": { "title": "🔗 Kết nối", "subtitle": "Tồn tại kỹ thuật số" },
      "protect": { "title": "🛡️ Bảo vệ", "subtitle": "Được bảo vệ bởi hệ thống" },
      "settle": { "title": "🌱 Định cư", "subtitle": "Sâu hơn với Phivis" }
    },
    "step": {
      "airport_arrival": { "title": "Đến sân bay", "desc": "Việc cần làm sau nhập cảnh", "emotion": "Bạn đã đến! Từng bước một nhé." },
      "temp_housing": { "title": "Chỗ ở tạm", "desc": "Đảm bảo nơi ở đêm đầu" },
      "prepaid_sim": { "title": "SIM trả trước", "desc": "Mua tại cửa hàng tiện lợi sân bay" },
      "arc_apply": { "title": "Đăng ký ARC", "desc": "Nộp đơn tại sở di trú trong 90 ngày", "caution": "Phạt nếu không nộp trong 90 ngày", "emotion": "Bước quan trọng nhất. Xong bước này, mọi thứ sẽ mở ra." },
      "arc_waiting": { "title": "Chờ ARC", "desc": "2-4 tuần. Có những việc bạn có thể chuẩn bị.", "emotion": "Bực bội phải không? Bình thường thôi. Hàn Quốc cần ARC cho hầu hết mọi thứ." },
      "arc_received": { "title": "Nhận ARC", "desc": "Nhận tại sở di trú. Giờ có thể mở ngân hàng, điện thoại!", "emotion": "Chúc mừng! Giờ bạn có thể sinh hoạt đầy đủ tại Hàn Quốc." },
      "bank_open": { "title": "Mở tài khoản ngân hàng", "desc": "ARC + hộ chiếu", "caution": "Đến chi nhánh có quầy dành cho người nước ngoài", "emotion": "Có thể bị từ chối. Bình thường. Thử chi nhánh khác." },
      "postpaid_phone": { "title": "Chuyển trả sau", "desc": "Cần ARC + tài khoản ngân hàng" },
      "essential_apps": { "title": "Ứng dụng cần thiết", "desc": "KakaoTalk, Naver Map, Papago, T-money" },
      "health_insurance": { "title": "Bảo hiểm y tế", "desc": "Cách đăng ký khác nhau theo loại visa", "caution": "Không đăng ký có thể ảnh hưởng gia hạn visa" },
      "four_insurances": { "title": "4 loại bảo hiểm", "desc": "Hưu trí, y tế, thất nghiệp, tai nạn lao động" },
      "address_register": { "title": "Đăng ký địa chỉ", "desc": "Khai báo tại phường trong 14 ngày sau khi chuyển", "caution": "Phạt nếu không khai trong 14 ngày", "emotion": "Mang theo hợp đồng thuê nhà. Xin dấu xác nhận ngày để bảo vệ tiền đặt cọc." },
      "first_payslip": { "title": "Kiểm tra bảng lương đầu tiên", "desc": "Quét bảng lương bằng Phivis Scan" },
      "housing_stable": { "title": "Ổn định nhà ở", "desc": "Kiểm tra hợp đồng trong Tài liệu" },
      "phivis_score": { "title": "Xem Phivis Score", "desc": "Xem độ ổn định cư trú", "emotion": "Đã một tháng rồi. Nhìn lại xem bạn đã làm được bao nhiêu." }
    }
  },
  zh: {
    "title": "前30天",
    "subtitle": "知道顺序就不怕",
    "loading": "加载中...",
    "disclaimer": "本指南为一般信息，可能因个人情况而异。",
    "emergency": "紧急情况 119",
    "documents": "所需材料",
    "recommendedBank": "推荐银行",
    "recommendedPhone": "推荐套餐",
    "markDone": "完成",
    "skip": "跳过",
    "waiting": "约{{days}}天",
    "layer": {
      "land": { "title": "🛬 落地", "subtitle": "物理存在于韩国" },
      "identity": { "title": "🪪 证明身份", "subtitle": "法律上存在" },
      "connect": { "title": "🔗 连接世界", "subtitle": "数字化存在" },
      "protect": { "title": "🛡️ 获得保障", "subtitle": "受制度保护" },
      "settle": { "title": "🌱 扎根", "subtitle": "用Phivis深入" }
    },
    "step": {
      "airport_arrival": { "title": "到达机场", "desc": "入境后要做的事", "emotion": "终于到了！一步一步来。" },
      "temp_housing": { "title": "临时住所", "desc": "确保第一晚住处" },
      "prepaid_sim": { "title": "预付费SIM卡", "desc": "在机场便利店或运营商柜台购买" },
      "arc_apply": { "title": "申请外国人登录证(ARC)", "desc": "入境90天内在出入境管理局申请", "caution": "90天内未申请将被罚款", "emotion": "最重要的一步。完成后一切都会打开。" },
      "arc_waiting": { "title": "等待ARC", "desc": "申请后需要2-4周。这段时间可以提前准备。", "emotion": "烦躁吗？很正常。韩国没有ARC几乎什么都做不了。但如果现在准备好，拿到ARC那天就能立刻进入下一步。" },
      "arc_received": { "title": "领取ARC", "desc": "在出入境管理局领取。现在可以开银行、办手机了！", "emotion": "恭喜！现在可以正式在韩国生活了。" },
      "bank_open": { "title": "开设银行账户", "desc": "ARC + 护照开户", "caution": "去有外国人专用窗口的网点", "emotion": "可能会被拒绝，这很正常。试试其他网点。" },
      "postpaid_phone": { "title": "转后付费手机", "desc": "需要ARC + 银行账户" },
      "essential_apps": { "title": "必装应用", "desc": "KakaoTalk、Naver Map、Papago、T-money" },
      "health_insurance": { "title": "确认健康保险", "desc": "根据签证类型，加入方式不同", "caution": "未加入可能影响签证续签" },
      "four_insurances": { "title": "确认四大保险", "desc": "国民年金、健康保险、雇佣保险、产灾保险" },
      "address_register": { "title": "转入申报", "desc": "搬家后14天内到社区中心申报", "caution": "14天内未申报将被罚款", "emotion": "带上租房合同。同时申请确定日期印章以保护押金。" },
      "first_payslip": { "title": "查看第一份工资单", "desc": "用Phivis Scan扫描工资单" },
      "housing_stable": { "title": "住房稳定", "desc": "在文档中确认合同" },
      "phivis_score": { "title": "查看Phivis Score", "desc": "一目了然的居留稳定性", "emotion": "已经一个月了。看看你已经完成了多少。" }
    }
  }
};

const langs = ['ko', 'en', 'vi', 'zh'];
for (const lang of langs) {
  const filePath = path.join(LOCALES_DIR, `${lang}.json`);
  if (!fs.existsSync(filePath)) { console.error(`❌ ${filePath} not found`); continue; }
  const existing = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  existing.first30 = first30Keys[lang];
  fs.writeFileSync(filePath, JSON.stringify(existing, null, 2) + '\n', 'utf-8');
  console.log(`✅ ${lang}.json — "first30" 섹션 병합 완료`);
}
