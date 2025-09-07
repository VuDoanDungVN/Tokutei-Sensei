import React, { useState } from 'react';
import Card from './shared/Card';
import { AppContext } from '../App';

// Data for 14 Tokutei industries with their exam periods
const tokuteiIndustries = [
  {
    id: 1,
    name: '介護 (Kaigo)',
    nameVi: 'Chăm sóc người cao tuổi',
    color: 'bg-blue-500',
    icon: '👴',
    exams: ['Kỳ thi tháng 1', 'Kỳ thi tháng 4', 'Kỳ thi tháng 7', 'Kỳ thi tháng 10'],
    description: 'Chăm sóc và hỗ trợ người cao tuổi trong các hoạt động sinh hoạt hàng ngày',
    examStructure: {
      totalQuestions: 50,
      timeLimit: 90,
      passingScore: 60,
      subjects: [
        'Kiến thức cơ bản về chăm sóc',
        'Kỹ thuật hỗ trợ sinh hoạt',
        'Tâm lý người cao tuổi',
        'An toàn và vệ sinh'
      ]
    },
    careerInfo: {
      workplaces: ['Viện dưỡng lão', 'Nhà chăm sóc', 'Dịch vụ tại nhà'],
      salary: '¥180,000-280,000/tháng',
      benefits: ['Bảo hiểm đầy đủ', 'Nghỉ phép có lương', 'Đào tạo nâng cao']
    },
    examDetails: {
      2024: [
        { 
          month: 'Tháng 1', 
          date: '15/01/2024', 
          location: 'Hà Nội, TP.HCM', 
          status: 'Đã kết thúc',
          pastExams: [
            { year: '2024', month: '1', questions: 50, difficulty: 'Trung bình', available: true },
            { year: '2023', month: '1', questions: 50, difficulty: 'Khó', available: true },
            { year: '2022', month: '1', questions: 50, difficulty: 'Dễ', available: true }
          ]
        },
        { 
          month: 'Tháng 4', 
          date: '20/04/2024', 
          location: 'Hà Nội, TP.HCM, Đà Nẵng', 
          status: 'Đã kết thúc',
          pastExams: [
            { year: '2024', month: '4', questions: 50, difficulty: 'Trung bình', available: true },
            { year: '2023', month: '4', questions: 50, difficulty: 'Khó', available: true },
            { year: '2022', month: '4', questions: 50, difficulty: 'Dễ', available: true }
          ]
        },
        { 
          month: 'Tháng 7', 
          date: '18/07/2024', 
          location: 'Hà Nội, TP.HCM', 
          status: 'Đã kết thúc',
          pastExams: [
            { year: '2024', month: '7', questions: 50, difficulty: 'Trung bình', available: true },
            { year: '2023', month: '7', questions: 50, difficulty: 'Khó', available: true },
            { year: '2022', month: '7', questions: 50, difficulty: 'Dễ', available: true }
          ]
        },
        { 
          month: 'Tháng 10', 
          date: '22/10/2024', 
          location: 'Hà Nội, TP.HCM, Đà Nẵng', 
          status: 'Đã kết thúc',
          pastExams: [
            { year: '2024', month: '10', questions: 50, difficulty: 'Trung bình', available: true },
            { year: '2023', month: '10', questions: 50, difficulty: 'Khó', available: true },
            { year: '2022', month: '10', questions: 50, difficulty: 'Dễ', available: true }
          ]
        }
      ],
      2025: [
        { 
          month: 'Tháng 1', 
          date: '15/01/2025', 
          location: 'Hà Nội, TP.HCM', 
          status: 'Sắp diễn ra',
          pastExams: []
        },
        { 
          month: 'Tháng 4', 
          date: '20/04/2025', 
          location: 'Hà Nội, TP.HCM, Đà Nẵng', 
          status: 'Chưa mở đăng ký',
          pastExams: []
        },
        { 
          month: 'Tháng 7', 
          date: '18/07/2025', 
          location: 'Hà Nội, TP.HCM', 
          status: 'Chưa mở đăng ký',
          pastExams: []
        },
        { 
          month: 'Tháng 10', 
          date: '22/10/2025', 
          location: 'Hà Nội, TP.HCM, Đà Nẵng', 
          status: 'Chưa mở đăng ký',
          pastExams: []
        }
      ]
    }
  },
  {
    id: 2,
    name: '建設 (Kensetsu)',
    nameVi: 'Xây dựng',
    color: 'bg-orange-500',
    icon: '🏗️',
    exams: ['Kỳ thi tháng 2', 'Kỳ thi tháng 5', 'Kỳ thi tháng 8', 'Kỳ thi tháng 11'],
    description: 'Tham gia các công trình xây dựng, sửa chữa và bảo trì nhà cửa, cơ sở hạ tầng',
    examStructure: {
      totalQuestions: 60,
      timeLimit: 120,
      passingScore: 65,
      subjects: [
        'An toàn lao động',
        'Kỹ thuật xây dựng cơ bản',
        'Đọc bản vẽ kỹ thuật',
        'Vật liệu xây dựng'
      ]
    },
    careerInfo: {
      workplaces: ['Công ty xây dựng', 'Dự án nhà ở', 'Cơ sở hạ tầng'],
      salary: '¥200,000-350,000/tháng',
      benefits: ['Lương theo giờ', 'Phụ cấp nguy hiểm', 'Bảo hiểm lao động']
    },
    examDetails: {
      2024: [
        { month: 'Tháng 2', date: '12/02/2024', location: 'Hà Nội, TP.HCM', status: 'Đã kết thúc' },
        { month: 'Tháng 5', date: '25/05/2024', location: 'Hà Nội, TP.HCM, Đà Nẵng', status: 'Đã kết thúc' },
        { month: 'Tháng 8', date: '15/08/2024', location: 'Hà Nội, TP.HCM', status: 'Đã kết thúc' },
        { month: 'Tháng 11', date: '28/11/2024', location: 'Hà Nội, TP.HCM, Đà Nẵng', status: 'Đã kết thúc' }
      ],
      2025: [
        { month: 'Tháng 2', date: '12/02/2025', location: 'Hà Nội, TP.HCM', status: 'Sắp diễn ra' },
        { month: 'Tháng 5', date: '25/05/2025', location: 'Hà Nội, TP.HCM, Đà Nẵng', status: 'Chưa mở đăng ký' },
        { month: 'Tháng 8', date: '15/08/2025', location: 'Hà Nội, TP.HCM', status: 'Chưa mở đăng ký' },
        { month: 'Tháng 11', date: '28/11/2025', location: 'Hà Nội, TP.HCM, Đà Nẵng', status: 'Chưa mở đăng ký' }
      ]
    }
  },
  {
    id: 3,
    name: '農業 (Nougyou)',
    nameVi: 'Nông nghiệp',
    color: 'bg-green-500',
    icon: '🌾',
    exams: ['Kỳ thi tháng 3', 'Kỳ thi tháng 6', 'Kỳ thi tháng 9', 'Kỳ thi tháng 12'],
    description: 'Trồng trọt, chăn nuôi và chế biến nông sản theo công nghệ hiện đại của Nhật Bản',
    examStructure: {
      totalQuestions: 45,
      timeLimit: 100,
      passingScore: 60,
      subjects: [
        'Kỹ thuật trồng trọt',
        'Chăn nuôi gia súc',
        'Sử dụng máy móc nông nghiệp',
        'An toàn thực phẩm'
      ]
    },
    careerInfo: {
      workplaces: ['Trang trại', 'Nhà kính', 'Cơ sở chế biến'],
      salary: '¥160,000-250,000/tháng',
      benefits: ['Nhà ở miễn phí', 'Thực phẩm tươi', 'Môi trường trong lành']
    },
    examDetails: {
      2024: [
        { month: 'Tháng 3', date: '10/03/2024', location: 'Hà Nội, TP.HCM', status: 'Đã kết thúc' },
        { month: 'Tháng 6', date: '22/06/2024', location: 'Hà Nội, TP.HCM, Đà Nẵng', status: 'Đã kết thúc' },
        { month: 'Tháng 9', date: '12/09/2024', location: 'Hà Nội, TP.HCM', status: 'Đã kết thúc' },
        { month: 'Tháng 12', date: '25/12/2024', location: 'Hà Nội, TP.HCM, Đà Nẵng', status: 'Đã kết thúc' }
      ],
      2025: [
        { month: 'Tháng 3', date: '10/03/2025', location: 'Hà Nội, TP.HCM', status: 'Sắp diễn ra' },
        { month: 'Tháng 6', date: '22/06/2025', location: 'Hà Nội, TP.HCM, Đà Nẵng', status: 'Chưa mở đăng ký' },
        { month: 'Tháng 9', date: '12/09/2025', location: 'Hà Nội, TP.HCM', status: 'Chưa mở đăng ký' },
        { month: 'Tháng 12', date: '25/12/2025', location: 'Hà Nội, TP.HCM, Đà Nẵng', status: 'Chưa mở đăng ký' }
      ]
    }
  },
  {
    id: 4,
    name: '漁業 (Gyogyou)',
    nameVi: 'Ngư nghiệp',
    color: 'bg-cyan-500',
    icon: '🐟',
    exams: ['Kỳ thi tháng 1', 'Kỳ thi tháng 4', 'Kỳ thi tháng 7', 'Kỳ thi tháng 10'],
    description: 'Đánh bắt và nuôi trồng thủy sản, chế biến hải sản theo tiêu chuẩn Nhật Bản',
    examStructure: {
      totalQuestions: 40,
      timeLimit: 80,
      passingScore: 60,
      subjects: [
        'Kỹ thuật đánh bắt',
        'Nuôi trồng thủy sản',
        'An toàn trên biển',
        'Chế biến hải sản'
      ]
    },
    careerInfo: {
      workplaces: ['Tàu đánh cá', 'Trang trại nuôi cá', 'Nhà máy chế biến'],
      salary: '¥170,000-280,000/tháng',
      benefits: ['Lương theo mùa', 'Thực phẩm tươi', 'Môi trường biển']
    },
    examDetails: {
      2024: [
        { month: 'Tháng 1', date: '18/01/2024', location: 'Hà Nội, TP.HCM', status: 'Đã kết thúc' },
        { month: 'Tháng 4', date: '25/04/2024', location: 'Hà Nội, TP.HCM, Đà Nẵng', status: 'Đã kết thúc' },
        { month: 'Tháng 7', date: '20/07/2024', location: 'Hà Nội, TP.HCM', status: 'Đã kết thúc' },
        { month: 'Tháng 10', date: '28/10/2024', location: 'Hà Nội, TP.HCM, Đà Nẵng', status: 'Đã kết thúc' }
      ],
      2025: [
        { month: 'Tháng 1', date: '18/01/2025', location: 'Hà Nội, TP.HCM', status: 'Sắp diễn ra' },
        { month: 'Tháng 4', date: '25/04/2025', location: 'Hà Nội, TP.HCM, Đà Nẵng', status: 'Chưa mở đăng ký' },
        { month: 'Tháng 7', date: '20/07/2025', location: 'Hà Nội, TP.HCM', status: 'Chưa mở đăng ký' },
        { month: 'Tháng 10', date: '28/10/2025', location: 'Hà Nội, TP.HCM, Đà Nẵng', status: 'Chưa mở đăng ký' }
      ]
    }
  },
  {
    id: 5,
    name: '飲食料品製造業',
    nameVi: 'Chế biến thực phẩm',
    color: 'bg-red-500',
    icon: '🍱',
    exams: ['Kỳ thi tháng 2', 'Kỳ thi tháng 5', 'Kỳ thi tháng 8', 'Kỳ thi tháng 11'],
    description: 'Sản xuất và chế biến thực phẩm, đồ uống theo tiêu chuẩn vệ sinh an toàn thực phẩm Nhật Bản',
    examStructure: {
      totalQuestions: 55,
      timeLimit: 110,
      passingScore: 65,
      subjects: [
        'An toàn thực phẩm',
        'Quy trình sản xuất',
        'Vệ sinh công nghiệp',
        'Kiểm soát chất lượng'
      ]
    },
    careerInfo: {
      workplaces: ['Nhà máy thực phẩm', 'Cơ sở chế biến', 'Phòng thí nghiệm'],
      salary: '¥190,000-320,000/tháng',
      benefits: ['Môi trường sạch sẽ', 'Đào tạo chuyên môn', 'Bảo hiểm đầy đủ']
    },
    examDetails: {
      2024: [
        { month: 'Tháng 2', date: '14/02/2024', location: 'Hà Nội, TP.HCM', status: 'Đã kết thúc' },
        { month: 'Tháng 5', date: '28/05/2024', location: 'Hà Nội, TP.HCM, Đà Nẵng', status: 'Đã kết thúc' },
        { month: 'Tháng 8', date: '18/08/2024', location: 'Hà Nội, TP.HCM', status: 'Đã kết thúc' },
        { month: 'Tháng 11', date: '30/11/2024', location: 'Hà Nội, TP.HCM, Đà Nẵng', status: 'Đã kết thúc' }
      ],
      2025: [
        { month: 'Tháng 2', date: '14/02/2025', location: 'Hà Nội, TP.HCM', status: 'Sắp diễn ra' },
        { month: 'Tháng 5', date: '28/05/2025', location: 'Hà Nội, TP.HCM, Đà Nẵng', status: 'Chưa mở đăng ký' },
        { month: 'Tháng 8', date: '18/08/2025', location: 'Hà Nội, TP.HCM', status: 'Chưa mở đăng ký' },
        { month: 'Tháng 11', date: '30/11/2025', location: 'Hà Nội, TP.HCM, Đà Nẵng', status: 'Chưa mở đăng ký' }
      ]
    }
  },
  {
    id: 6,
    name: '外食業 (Gaishokugyou)',
    nameVi: 'Dịch vụ ăn uống',
    color: 'bg-pink-500',
    icon: '🍽️',
    exams: ['Kỳ thi tháng 3', 'Kỳ thi tháng 6', 'Kỳ thi tháng 9', 'Kỳ thi tháng 12'],
    examDetails: {
      2024: [
        { month: 'Tháng 3', date: '12/03/2024', location: 'Hà Nội, TP.HCM', status: 'Đã kết thúc' },
        { month: 'Tháng 6', date: '25/06/2024', location: 'Hà Nội, TP.HCM, Đà Nẵng', status: 'Đã kết thúc' },
        { month: 'Tháng 9', date: '15/09/2024', location: 'Hà Nội, TP.HCM', status: 'Đã kết thúc' },
        { month: 'Tháng 12', date: '28/12/2024', location: 'Hà Nội, TP.HCM, Đà Nẵng', status: 'Đã kết thúc' }
      ],
      2025: [
        { month: 'Tháng 3', date: '12/03/2025', location: 'Hà Nội, TP.HCM', status: 'Sắp diễn ra' },
        { month: 'Tháng 6', date: '25/06/2025', location: 'Hà Nội, TP.HCM, Đà Nẵng', status: 'Chưa mở đăng ký' },
        { month: 'Tháng 9', date: '15/09/2025', location: 'Hà Nội, TP.HCM', status: 'Chưa mở đăng ký' },
        { month: 'Tháng 12', date: '28/12/2025', location: 'Hà Nội, TP.HCM, Đà Nẵng', status: 'Chưa mở đăng ký' }
      ]
    }
  },
  {
    id: 7,
    name: '宿泊業 (Shukuhakugyou)',
    nameVi: 'Lưu trú',
    color: 'bg-indigo-500',
    icon: '🏨',
    exams: ['Kỳ thi tháng 1', 'Kỳ thi tháng 4', 'Kỳ thi tháng 7', 'Kỳ thi tháng 10'],
    examDetails: {
      2024: [
        { month: 'Tháng 1', date: '20/01/2024', location: 'Hà Nội, TP.HCM', status: 'Đã kết thúc' },
        { month: 'Tháng 4', date: '22/04/2024', location: 'Hà Nội, TP.HCM, Đà Nẵng', status: 'Đã kết thúc' },
        { month: 'Tháng 7', date: '25/07/2024', location: 'Hà Nội, TP.HCM', status: 'Đã kết thúc' },
        { month: 'Tháng 10', date: '30/10/2024', location: 'Hà Nội, TP.HCM, Đà Nẵng', status: 'Đã kết thúc' }
      ],
      2025: [
        { month: 'Tháng 1', date: '20/01/2025', location: 'Hà Nội, TP.HCM', status: 'Sắp diễn ra' },
        { month: 'Tháng 4', date: '22/04/2025', location: 'Hà Nội, TP.HCM, Đà Nẵng', status: 'Chưa mở đăng ký' },
        { month: 'Tháng 7', date: '25/07/2025', location: 'Hà Nội, TP.HCM', status: 'Chưa mở đăng ký' },
        { month: 'Tháng 10', date: '30/10/2025', location: 'Hà Nội, TP.HCM, Đà Nẵng', status: 'Chưa mở đăng ký' }
      ]
    }
  },
  {
    id: 8,
    name: '自動車整備業',
    nameVi: 'Bảo dưỡng ô tô',
    color: 'bg-gray-500',
    icon: '🚗',
    exams: ['Kỳ thi tháng 2', 'Kỳ thi tháng 5', 'Kỳ thi tháng 8', 'Kỳ thi tháng 11'],
    examDetails: {
      2024: [
        { month: 'Tháng 2', date: '16/02/2024', location: 'Hà Nội, TP.HCM', status: 'Đã kết thúc' },
        { month: 'Tháng 5', date: '30/05/2024', location: 'Hà Nội, TP.HCM, Đà Nẵng', status: 'Đã kết thúc' },
        { month: 'Tháng 8', date: '20/08/2024', location: 'Hà Nội, TP.HCM', status: 'Đã kết thúc' },
        { month: 'Tháng 11', date: '02/12/2024', location: 'Hà Nội, TP.HCM, Đà Nẵng', status: 'Đã kết thúc' }
      ],
      2025: [
        { month: 'Tháng 2', date: '16/02/2025', location: 'Hà Nội, TP.HCM', status: 'Sắp diễn ra' },
        { month: 'Tháng 5', date: '30/05/2025', location: 'Hà Nội, TP.HCM, Đà Nẵng', status: 'Chưa mở đăng ký' },
        { month: 'Tháng 8', date: '20/08/2025', location: 'Hà Nội, TP.HCM', status: 'Chưa mở đăng ký' },
        { month: 'Tháng 11', date: '02/12/2025', location: 'Hà Nội, TP.HCM, Đà Nẵng', status: 'Chưa mở đăng ký' }
      ]
    }
  },
  {
    id: 9,
    name: '航空業 (Koukuugyou)',
    nameVi: 'Hàng không',
    color: 'bg-sky-500',
    icon: '✈️',
    exams: ['Kỳ thi tháng 3', 'Kỳ thi tháng 6', 'Kỳ thi tháng 9', 'Kỳ thi tháng 12'],
    examDetails: {
      2024: [
        { month: 'Tháng 3', date: '14/03/2024', location: 'Hà Nội, TP.HCM', status: 'Đã kết thúc' },
        { month: 'Tháng 6', date: '28/06/2024', location: 'Hà Nội, TP.HCM, Đà Nẵng', status: 'Đã kết thúc' },
        { month: 'Tháng 9', date: '18/09/2024', location: 'Hà Nội, TP.HCM', status: 'Đã kết thúc' },
        { month: 'Tháng 12', date: '30/12/2024', location: 'Hà Nội, TP.HCM, Đà Nẵng', status: 'Đã kết thúc' }
      ],
      2025: [
        { month: 'Tháng 3', date: '14/03/2025', location: 'Hà Nội, TP.HCM', status: 'Sắp diễn ra' },
        { month: 'Tháng 6', date: '28/06/2025', location: 'Hà Nội, TP.HCM, Đà Nẵng', status: 'Chưa mở đăng ký' },
        { month: 'Tháng 9', date: '18/09/2025', location: 'Hà Nội, TP.HCM', status: 'Chưa mở đăng ký' },
        { month: 'Tháng 12', date: '30/12/2025', location: 'Hà Nội, TP.HCM, Đà Nẵng', status: 'Chưa mở đăng ký' }
      ]
    }
  },
  {
    id: 10,
    name: 'ビルクリーニング',
    nameVi: 'Vệ sinh tòa nhà',
    color: 'bg-teal-500',
    icon: '🧹',
    exams: ['Kỳ thi tháng 1', 'Kỳ thi tháng 4', 'Kỳ thi tháng 7', 'Kỳ thi tháng 10'],
    examDetails: {
      2024: [
        { month: 'Tháng 1', date: '22/01/2024', location: 'Hà Nội, TP.HCM', status: 'Đã kết thúc' },
        { month: 'Tháng 4', date: '24/04/2024', location: 'Hà Nội, TP.HCM, Đà Nẵng', status: 'Đã kết thúc' },
        { month: 'Tháng 7', date: '28/07/2024', location: 'Hà Nội, TP.HCM', status: 'Đã kết thúc' },
        { month: 'Tháng 10', date: '02/11/2024', location: 'Hà Nội, TP.HCM, Đà Nẵng', status: 'Đã kết thúc' }
      ],
      2025: [
        { month: 'Tháng 1', date: '22/01/2025', location: 'Hà Nội, TP.HCM', status: 'Sắp diễn ra' },
        { month: 'Tháng 4', date: '24/04/2025', location: 'Hà Nội, TP.HCM, Đà Nẵng', status: 'Chưa mở đăng ký' },
        { month: 'Tháng 7', date: '28/07/2025', location: 'Hà Nội, TP.HCM', status: 'Chưa mở đăng ký' },
        { month: 'Tháng 10', date: '02/11/2025', location: 'Hà Nội, TP.HCM, Đà Nẵng', status: 'Chưa mở đăng ký' }
      ]
    }
  },
  {
    id: 11,
    name: '製造業 (Seizougyou)',
    nameVi: 'Sản xuất',
    color: 'bg-yellow-500',
    icon: '🏭',
    exams: ['Kỳ thi tháng 2', 'Kỳ thi tháng 5', 'Kỳ thi tháng 8', 'Kỳ thi tháng 11'],
    examDetails: {
      2024: [
        { month: 'Tháng 2', date: '18/02/2024', location: 'Hà Nội, TP.HCM', status: 'Đã kết thúc' },
        { month: 'Tháng 5', date: '02/06/2024', location: 'Hà Nội, TP.HCM, Đà Nẵng', status: 'Đã kết thúc' },
        { month: 'Tháng 8', date: '22/08/2024', location: 'Hà Nội, TP.HCM', status: 'Đã kết thúc' },
        { month: 'Tháng 11', date: '04/12/2024', location: 'Hà Nội, TP.HCM, Đà Nẵng', status: 'Đã kết thúc' }
      ],
      2025: [
        { month: 'Tháng 2', date: '18/02/2025', location: 'Hà Nội, TP.HCM', status: 'Sắp diễn ra' },
        { month: 'Tháng 5', date: '02/06/2025', location: 'Hà Nội, TP.HCM, Đà Nẵng', status: 'Chưa mở đăng ký' },
        { month: 'Tháng 8', date: '22/08/2025', location: 'Hà Nội, TP.HCM', status: 'Chưa mở đăng ký' },
        { month: 'Tháng 11', date: '04/12/2025', location: 'Hà Nội, TP.HCM, Đà Nẵng', status: 'Chưa mở đăng ký' }
      ]
    }
  },
  {
    id: 12,
    name: '電気・電子情報関連産業',
    nameVi: 'Điện tử',
    color: 'bg-purple-500',
    icon: '💻',
    exams: ['Kỳ thi tháng 3', 'Kỳ thi tháng 6', 'Kỳ thi tháng 9', 'Kỳ thi tháng 12'],
    examDetails: {
      2024: [
        { month: 'Tháng 3', date: '16/03/2024', location: 'Hà Nội, TP.HCM', status: 'Đã kết thúc' },
        { month: 'Tháng 6', date: '30/06/2024', location: 'Hà Nội, TP.HCM, Đà Nẵng', status: 'Đã kết thúc' },
        { month: 'Tháng 9', date: '20/09/2024', location: 'Hà Nội, TP.HCM', status: 'Đã kết thúc' },
        { month: 'Tháng 12', date: '02/01/2025', location: 'Hà Nội, TP.HCM, Đà Nẵng', status: 'Đã kết thúc' }
      ],
      2025: [
        { month: 'Tháng 3', date: '16/03/2025', location: 'Hà Nội, TP.HCM', status: 'Sắp diễn ra' },
        { month: 'Tháng 6', date: '30/06/2025', location: 'Hà Nội, TP.HCM, Đà Nẵng', status: 'Chưa mở đăng ký' },
        { month: 'Tháng 9', date: '20/09/2025', location: 'Hà Nội, TP.HCM', status: 'Chưa mở đăng ký' },
        { month: 'Tháng 12', date: '02/01/2026', location: 'Hà Nội, TP.HCM, Đà Nẵng', status: 'Chưa mở đăng ký' }
      ]
    }
  },
  {
    id: 13,
    name: '造船・舶用工業',
    nameVi: 'Đóng tàu',
    color: 'bg-emerald-500',
    icon: '🚢',
    exams: ['Kỳ thi tháng 1', 'Kỳ thi tháng 4', 'Kỳ thi tháng 7', 'Kỳ thi tháng 10'],
    examDetails: {
      2024: [
        { month: 'Tháng 1', date: '24/01/2024', location: 'Hà Nội, TP.HCM', status: 'Đã kết thúc' },
        { month: 'Tháng 4', date: '26/04/2024', location: 'Hà Nội, TP.HCM, Đà Nẵng', status: 'Đã kết thúc' },
        { month: 'Tháng 7', date: '30/07/2024', location: 'Hà Nội, TP.HCM', status: 'Đã kết thúc' },
        { month: 'Tháng 10', date: '04/11/2024', location: 'Hà Nội, TP.HCM, Đà Nẵng', status: 'Đã kết thúc' }
      ],
      2025: [
        { month: 'Tháng 1', date: '24/01/2025', location: 'Hà Nội, TP.HCM', status: 'Sắp diễn ra' },
        { month: 'Tháng 4', date: '26/04/2025', location: 'Hà Nội, TP.HCM, Đà Nẵng', status: 'Chưa mở đăng ký' },
        { month: 'Tháng 7', date: '30/07/2025', location: 'Hà Nội, TP.HCM', status: 'Chưa mở đăng ký' },
        { month: 'Tháng 10', date: '04/11/2025', location: 'Hà Nội, TP.HCM, Đà Nẵng', status: 'Chưa mở đăng ký' }
      ]
    }
  },
  {
    id: 14,
    name: '自動車製造業',
    nameVi: 'Sản xuất ô tô',
    color: 'bg-rose-500',
    icon: '🚙',
    exams: ['Kỳ thi tháng 2', 'Kỳ thi tháng 5', 'Kỳ thi tháng 8', 'Kỳ thi tháng 11'],
    examDetails: {
      2024: [
        { month: 'Tháng 2', date: '20/02/2024', location: 'Hà Nội, TP.HCM', status: 'Đã kết thúc' },
        { month: 'Tháng 5', date: '04/06/2024', location: 'Hà Nội, TP.HCM, Đà Nẵng', status: 'Đã kết thúc' },
        { month: 'Tháng 8', date: '24/08/2024', location: 'Hà Nội, TP.HCM', status: 'Đã kết thúc' },
        { month: 'Tháng 11', date: '06/12/2024', location: 'Hà Nội, TP.HCM, Đà Nẵng', status: 'Đã kết thúc' }
      ],
      2025: [
        { month: 'Tháng 2', date: '20/02/2025', location: 'Hà Nội, TP.HCM', status: 'Sắp diễn ra' },
        { month: 'Tháng 5', date: '04/06/2025', location: 'Hà Nội, TP.HCM, Đà Nẵng', status: 'Chưa mở đăng ký' },
        { month: 'Tháng 8', date: '24/08/2025', location: 'Hà Nội, TP.HCM', status: 'Chưa mở đăng ký' },
        { month: 'Tháng 11', date: '06/12/2025', location: 'Hà Nội, TP.HCM, Đà Nẵng', status: 'Chưa mở đăng ký' }
      ]
    }
  }
];

const Tokutei: React.FC = () => {
  const [selectedIndustry, setSelectedIndustry] = useState<typeof tokuteiIndustries[0] | null>(null);
  const { setCurrentScreen } = React.useContext(AppContext);

  const handleViewDetails = (industry: typeof tokuteiIndustries[0]) => {
    setSelectedIndustry(industry);
  };

  const goBackToList = () => {
    setSelectedIndustry(null);
  };

  const handleStartExam = (industry: typeof tokuteiIndustries[0], examYear: string, examMonth: string) => {
    // Navigate to quiz with specific exam
    setCurrentScreen('QUIZ' as any);
    // You can pass exam details through context or URL params
  };

  const handleStudy = (industry: typeof tokuteiIndustries[0]) => {
    // Navigate to study materials
    setCurrentScreen('PRACTICE' as any);
  };

  // If an industry is selected, show the industry detail page
  if (selectedIndustry) {
    return (
      <div className="space-y-6">
        {/* Back Button */}
        <div className="flex items-center space-x-4">
          <button
            onClick={goBackToList}
            className="flex items-center space-x-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span>Quay lại</span>
          </button>
        </div>

        {/* Industry Header */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center space-x-4 mb-6">
            <div className={`w-16 h-16 ${selectedIndustry.color} rounded-lg flex items-center justify-center text-white text-2xl`}>
              {selectedIndustry.icon}
            </div>
            <div>
              <h1 className="text-3xl font-bold text-brand-text-primary">{selectedIndustry.name}</h1>
              <p className="text-xl text-brand-text-secondary">{selectedIndustry.nameVi}</p>
            </div>
          </div>

          {/* Industry Information */}
          <div className="bg-gradient-to-r from-blue-50 to-green-50 p-6 rounded-lg border border-blue-200">
            <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center">
              <svg className="w-5 h-5 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Thông tin ngành nghề
            </h3>
            <p className="text-gray-700 mb-4">{selectedIndustry.description}</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Exam Structure */}
              <div className="bg-white p-4 rounded-lg border border-blue-200">
                <h4 className="font-semibold text-blue-800 mb-3 flex items-center">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Cấu trúc đề thi
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Số câu hỏi:</span>
                    <span className="font-medium">{selectedIndustry.examStructure?.totalQuestions || 50} câu</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Thời gian:</span>
                    <span className="font-medium">{selectedIndustry.examStructure?.timeLimit || 90} phút</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Điểm đậu:</span>
                    <span className="font-medium">{selectedIndustry.examStructure?.passingScore || 60}%</span>
                  </div>
                </div>
                {selectedIndustry.examStructure?.subjects && (
                  <div className="mt-3">
                    <h5 className="font-medium text-gray-800 mb-2">Chủ đề thi:</h5>
                    <ul className="text-sm text-gray-600 space-y-1">
                      {selectedIndustry.examStructure.subjects.map((subject, index) => (
                        <li key={index} className="flex items-center">
                          <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-2"></span>
                          {subject}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Career Information */}
              <div className="bg-white p-4 rounded-lg border border-blue-200">
                <h4 className="font-semibold text-blue-800 mb-3 flex items-center">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H6a2 2 0 01-2-2V8a2 2 0 012-2V6" />
                  </svg>
                  Cơ hội nghề nghiệp
                </h4>
                <div className="space-y-3">
                  <div>
                    <h5 className="font-medium text-gray-800 mb-1">Nơi làm việc:</h5>
                    <div className="text-sm text-gray-600">
                      {selectedIndustry.careerInfo?.workplaces?.join(', ') || 'Các cơ sở liên quan'}
                    </div>
                  </div>
                  <div>
                    <h5 className="font-medium text-gray-800 mb-1">Mức lương:</h5>
                    <div className="text-sm text-gray-600">
                      {selectedIndustry.careerInfo?.salary || '¥180,000-300,000/tháng'}
                    </div>
                  </div>
                  {selectedIndustry.careerInfo?.benefits && (
                    <div>
                      <h5 className="font-medium text-gray-800 mb-1">Phúc lợi:</h5>
                      <ul className="text-sm text-gray-600 space-y-1">
                        {selectedIndustry.careerInfo.benefits.map((benefit, index) => (
                          <li key={index} className="flex items-center">
                            <span className="w-1.5 h-1.5 bg-green-500 rounded-full mr-2"></span>
                            {benefit}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Exam Details */}
        <div className="space-y-6">
          {/* 2024 Exams */}
          <div>
            <h3 className="text-xl font-semibold text-brand-text-primary mb-4 flex items-center">
              <span className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center mr-3">
                <span className="text-sm font-bold text-red-600">2024</span>
              </span>
              Kỳ thi năm 2024
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {selectedIndustry.examDetails[2024].map((exam, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-semibold text-brand-text-primary">{exam.month}</h4>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      exam.status === 'Đã kết thúc' 
                        ? 'bg-gray-100 text-gray-600' 
                        : exam.status === 'Sắp diễn ra'
                        ? 'bg-yellow-100 text-yellow-600'
                        : 'bg-blue-100 text-blue-600'
                    }`}>
                      {exam.status}
                    </span>
                  </div>
                  <div className="space-y-2 text-sm text-brand-text-secondary mb-4">
                    <div className="flex items-center">
                      <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      {exam.date}
                    </div>
                    <div className="flex items-center">
                      <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      {exam.location}
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleStartExam(selectedIndustry, '2024', exam.month)}
                      className="btn-primary px-3 py-1 text-sm rounded"
                    >
                      Làm bài
                    </button>
                    <button
                      onClick={() => handleStudy(selectedIndustry)}
                      className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded transition-colors"
                    >
                      Học ngay
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 2025 Exams */}
          <div>
            <h3 className="text-xl font-semibold text-brand-text-primary mb-4 flex items-center">
              <span className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                <span className="text-sm font-bold text-blue-600">2025</span>
              </span>
              Kỳ thi năm 2025
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {selectedIndustry.examDetails[2025].map((exam, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-semibold text-brand-text-primary">{exam.month}</h4>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      exam.status === 'Đã kết thúc' 
                        ? 'bg-gray-100 text-gray-600' 
                        : exam.status === 'Sắp diễn ra'
                        ? 'bg-yellow-100 text-yellow-600'
                        : 'bg-blue-100 text-blue-600'
                    }`}>
                      {exam.status}
                    </span>
                  </div>
                  <div className="space-y-2 text-sm text-brand-text-secondary mb-4">
                    <div className="flex items-center">
                      <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      {exam.date}
                    </div>
                    <div className="flex items-center">
                      <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      {exam.location}
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleStartExam(selectedIndustry, '2025', exam.month)}
                      className="btn-primary px-3 py-1 text-sm rounded"
                    >
                      Làm bài
                    </button>
                    <button
                      onClick={() => handleStudy(selectedIndustry)}
                      className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded transition-colors"
                    >
                      Học ngay
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Default view - show all industries
  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-bold text-brand-text-primary">Tokutei</h1>
        <p className="text-brand-text-secondary">14 ngành nghề Tokutei và các kỳ thi</p>
      </header>

      {/* Introduction */}
      <Card className="p-6 bg-gradient-to-r from-brand-blue to-teal-400 text-white">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Chương trình Tokutei (特定技能)</h2>
          <p className="mb-4">Chương trình visa lao động mới của Nhật Bản cho phép người nước ngoài làm việc trong 14 ngành nghề cụ thể</p>
          <div className="flex flex-wrap justify-center gap-2 text-sm">
            <span className="bg-white bg-opacity-20 px-3 py-1 rounded-full">Tuổi: 18-30</span>
            <span className="bg-white bg-opacity-20 px-3 py-1 rounded-full">Tiếng Nhật: N4</span>
            <span className="bg-white bg-opacity-20 px-3 py-1 rounded-full">Làm việc: 5 năm</span>
          </div>
        </div>
      </Card>

      {/* 14 Industry Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {tokuteiIndustries.map((industry) => (
          <Card 
            key={industry.id} 
            className="p-4 hover:shadow-lg transition-shadow duration-300 cursor-pointer"
            onClick={() => handleViewDetails(industry)}
          >
            {/* Industry Header */}
            <div className="flex items-center space-x-3">
              <div className={`w-12 h-12 ${industry.color} rounded-lg flex items-center justify-center text-white text-xl`}>
                {industry.icon}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-brand-text-primary text-base leading-tight">
                  {industry.name}
                </h3>
                <p className="text-sm text-brand-text-secondary truncate">
                  {industry.nameVi}
                </p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Additional Information */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Requirements */}
        <Card className="p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-semibold text-brand-text-primary">Điều kiện tham gia</h2>
              <p className="text-sm text-brand-text-secondary">Yêu cầu cơ bản</p>
            </div>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <h3 className="font-medium text-brand-text-primary">Tuổi từ 18-30</h3>
                <p className="text-sm text-brand-text-secondary">Độ tuổi phù hợp để tham gia chương trình</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <h3 className="font-medium text-brand-text-primary">Trình độ tiếng Nhật N4</h3>
                <p className="text-sm text-brand-text-secondary">Có chứng chỉ JLPT N4 hoặc tương đương</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <h3 className="font-medium text-brand-text-primary">Kỹ năng nghề nghiệp</h3>
                <p className="text-sm text-brand-text-secondary">Có kinh nghiệm hoặc được đào tạo trong ngành nghề tương ứng</p>
              </div>
            </div>
          </div>
        </Card>

        {/* Benefits */}
        <Card className="p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-12 h-12 bg-yellow-500 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-semibold text-brand-text-primary">Lợi ích</h2>
              <p className="text-sm text-brand-text-secondary">Ưu điểm của chương trình</p>
            </div>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
              <span className="text-brand-text-secondary text-sm">Làm việc lâu dài tại Nhật Bản (tối đa 5 năm)</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
              <span className="text-brand-text-secondary text-sm">Mức lương cạnh tranh và ổn định</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
              <span className="text-brand-text-secondary text-sm">Được đào tạo kỹ năng chuyên môn</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
              <span className="text-brand-text-secondary text-sm">Cơ hội chuyển đổi sang visa kỹ năng đặc định</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
              <span className="text-brand-text-secondary text-sm">Hỗ trợ từ công ty tiếp nhận</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Contact Information */}
      <Card className="p-6 bg-gradient-to-r from-purple-500 to-pink-500 text-white">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Bạn có quan tâm đến chương trình Tokutei?</h2>
          <p className="mb-4">Liên hệ với chúng tôi để được tư vấn chi tiết về ngành nghề phù hợp</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button className="px-6 py-3 bg-white text-purple-600 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
              📞 Liên hệ tư vấn
            </button>
            <button className="px-6 py-3 bg-white bg-opacity-20 text-white rounded-lg font-semibold hover:bg-opacity-30 transition-colors">
              📋 Đăng ký thông tin
            </button>
          </div>
        </div>
      </Card>

    </div>
  );
};

export default Tokutei;