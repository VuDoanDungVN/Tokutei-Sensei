# Kaigo Sensei - Ứng Dụng Luyện Thi Kaigo Fukushi (介護福祉士)

## 📋 Giới thiệu

Kaigo Sensei là một ứng dụng web được thiết kế để hỗ trợ việc luyện thi chứng chỉ Kaigo Fukushi (介護福祉士) - chứng chỉ chăm sóc người cao tuổi tại Nhật Bản. Ứng dụng cung cấp các tính năng học tập và thực hành để giúp người dùng chuẩn bị tốt nhất cho kỳ thi.

## 🚀 Tính năng chính

### 🔐 Xác thực người dùng
- **Đăng ký tài khoản**: Tạo tài khoản mới với email và mật khẩu
- **Xác thực email**: Bắt buộc xác thực email trước khi có thể đăng nhập
- **Đăng nhập an toàn**: Xác thực người dùng với Firebase Authentication
- **Quản lý phiên đăng nhập**: Tự động duy trì trạng thái đăng nhập

### 📚 Hệ thống học tập
- **Giao diện đa ngôn ngữ**: Hỗ trợ tiếng Việt và tiếng Nhật
- **Dashboard cá nhân**: Trang chủ hiển thị thông tin người dùng
- **Luyện thi tương tác**: Các bài tập và câu hỏi thực hành
- **Theo dõi tiến độ**: Theo dõi kết quả học tập và cải thiện

### 🎨 Giao diện người dùng
- **Thiết kế hiện đại**: Sử dụng Tailwind CSS cho giao diện đẹp mắt
- **Responsive**: Tương thích với mọi thiết bị (desktop, tablet, mobile)
- **Trải nghiệm mượt mà**: Animations và transitions mượt mà
- **Thông báo thông minh**: Hệ thống thông báo với auto-hide và countdown

## 🛠️ Công nghệ sử dụng

### Frontend
- **React 18**: Framework JavaScript hiện đại
- **TypeScript**: Type-safe development
- **Vite**: Build tool nhanh và hiệu quả
- **Tailwind CSS**: Utility-first CSS framework
- **React Context**: State management

### Backend & Services
- **Firebase Authentication**: Xác thực người dùng
- **Firebase Firestore**: Cơ sở dữ liệu NoSQL (tạm thời tắt)
- **Google Gemini AI**: Tích hợp AI cho tính năng thông minh

### Development Tools
- **ESLint**: Code linting và formatting
- **Prettier**: Code formatting
- **Git**: Version control

## 📦 Cài đặt và chạy dự án

### Yêu cầu hệ thống
- Node.js (phiên bản 16 trở lên)
- npm hoặc yarn
- Git

### Các bước cài đặt

1. **Clone repository**
```bash
git clone <repository-url>
cd kaigo-sensei
```

2. **Cài đặt dependencies**
```bash
npm install
```

3. **Cấu hình Firebase**
   - Tạo project Firebase mới
   - Bật Authentication (Email/Password)
   - Bật Firestore Database
   - Copy config và thêm vào `firebase.ts`

4. **Chạy development server**
```bash
npm run dev
```

5. **Build cho production**
```bash
npm run build
```

## 📁 Cấu trúc thư mục

```
kaigo-sensei/
├── components/           # React components
│   ├── auth/            # Authentication components
│   │   ├── Login.tsx    # Component đăng nhập
│   │   └── Signup.tsx   # Component đăng ký
│   └── ...
├── services/            # Business logic và API calls
│   ├── geminiService.ts # Firebase Auth & Firestore
│   └── appService.ts    # App utilities
├── constants.tsx        # Constants và translations
├── App.tsx             # Main application component
├── index.html          # HTML template
└── package.json        # Dependencies và scripts
```

## 🔧 Cấu hình

### Firebase Configuration
Cấu hình Firebase trong file `services/geminiService.ts`:

```typescript
const firebaseConfig = {
  apiKey: "your-api-key",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "your-app-id"
};
```

### Environment Variables
Tạo file `.env.local` cho các biến môi trường:

```env
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
```

## 🎯 Tính năng đang phát triển

- [ ] **Hệ thống câu hỏi**: Tích hợp câu hỏi luyện thi Kaigo Fukushi
- [ ] **AI Chatbot**: Tích hợp Gemini AI để hỗ trợ học tập
- [ ] **Theo dõi tiến độ**: Dashboard chi tiết về kết quả học tập
- [ ] **Thi thử**: Chế độ thi thử với thời gian giới hạn
- [ ] **Báo cáo**: Xuất báo cáo kết quả học tập
- [ ] **Mobile App**: Phát triển ứng dụng mobile

## 🐛 Xử lý lỗi đã biết

### Firestore Permissions
- **Vấn đề**: "Missing or insufficient permissions" khi ghi dữ liệu
- **Giải pháp tạm thời**: Firestore write operations đã được comment out
- **Giải pháp dài hạn**: Cấu hình Firestore security rules

### Build Warnings
- **Chunk size warning**: Một số chunks lớn hơn 500KB
- **Giải pháp**: Sử dụng code splitting và dynamic imports

## 🤝 Đóng góp

Chúng tôi hoan nghênh mọi đóng góp từ cộng đồng! Để đóng góp:

1. Fork repository
2. Tạo feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Mở Pull Request

## 📝 License

Dự án này được phân phối dưới MIT License. Xem file `LICENSE` để biết thêm chi tiết.

## 📞 Liên hệ

- **Email**: [your-email@example.com]
- **GitHub**: [your-github-username]
- **Website**: [your-website.com]

## 🙏 Lời cảm ơn

- Firebase team cho authentication và database services
- Google Gemini team cho AI integration
- React và Vite communities cho các tools tuyệt vời
- Tất cả contributors đã đóng góp vào dự án

---

**Lưu ý**: Dự án đang trong giai đoạn phát triển. Một số tính năng có thể chưa hoàn thiện hoặc đang được cải thiện.