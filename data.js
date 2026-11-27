// Default store facility & equipment products for NSHOP
const DEFAULT_PRODUCTS = [
  {
    id: "pos-01",
    title: "เครื่องคิดเงิน POS จอคู่สัมผัส ProMax",
    category: "ระบบ POS",
    group: "ระบบ POS",
    badge: "POS",
    highlight: "★ ขายดี",
    price: 14900,
    stock: 18,
    rating: 4.9,
    updatedText: "15 นาทีที่แล้ว",
    image: "assets/images/pos-terminal.jpg",
    description:
      "เครื่องคิดเงิน POS จอสัมผัสคู่ 15.6 นิ้ว + จอลูกค้า 11.6 นิ้ว รองรับโปรแกรมขายหน้าร้านทุกค่าย พร้อมลิ้นชักเก็บเงินอัตโนมัติ"
  },
  {
    id: "rack-01",
    title: "ชั้นวางสินค้า Gondola เหล็กเคลือบอย่างดี",
    category: "ชั้นวางสินค้า",
    group: "ชั้นวาง & ตู้แช่",
    badge: "RACK",
    highlight: "★ แนะนำ",
    price: 3890,
    stock: 32,
    rating: 4.8,
    updatedText: "32 นาทีที่แล้ว",
    image: "assets/images/display-rack.svg",
    description:
      "ชั้นวางสินค้าแบบ 2 หน้า ปรับระดับชั้นได้ 5 ระดับ รับน้ำหนักได้ชั้นละ 60 กก. เหมาะสำหรับมินิมาร์ทและร้านค้าทั่วไป"
  },
  {
    id: "chill-01",
    title: "ตู้แช่เครื่องดื่มประตูกระจก 2 บาน LED",
    category: "ตู้แช่ & ความเย็น",
    group: "ชั้นวาง & ตู้แช่",
    badge: "CHILLER",
    highlight: "★ ประหยัดไฟ",
    price: 22500,
    stock: 9,
    rating: 4.9,
    updatedText: "1 ชั่วโมงที่แล้ว",
    image: "assets/images/glass-chiller.jpg",
    description:
      "ตู้แช่เย็นระบบ Inverter ทำความเย็น 2–8°C กระจก 2 ชั้นลดฝ้า พร้อมไฟ LED ส่องสว่างภายในโชว์สินค้าสวยงาม"
  },
  {
    id: "scan-01",
    title: "เครื่องสแกนบาร์โค้ด 2D ไร้สาย + เครื่องพิมพ์ใบเสร็จ",
    category: "สแกนเนอร์",
    group: "ระบบ POS",
    badge: "SCANNER",
    highlight: "★ ใหม่",
    price: 4290,
    stock: 25,
    rating: 4.7,
    updatedText: "2 ชั่วโมงที่แล้ว",
    image: "assets/images/barcode-scanner.svg",
    description:
      "ชุดสแกนบาร์โค้ดและ QR Code 2D ไร้สาย พร้อมแท่นชาร์จและเครื่องพิมพ์ใบเสร็จความร้อน 80mm ตัดกระดาษอัตโนมัติ"
  },
  {
    id: "cctv-01",
    title: "กล้องวงจรปิด 4K Dome Night Vision",
    category: "ความปลอดภัย",
    group: "อุปกรณ์หน้าร้าน",
    badge: "SECURITY",
    highlight: "★ ปลอดภัย",
    price: 2790,
    stock: 40,
    rating: 4.8,
    updatedText: "3 ชั่วโมงที่แล้ว",
    image: "assets/images/cctv-camera.jpg",
    description:
      "กล้องวงจรปิดความละเอียด 4K มุมกว้าง 130° มองเห็นชัดในที่มืด ดูออนไลน์ผ่านมือถือได้ตลอด 24 ชม."
  },
  {
    id: "cnt-01",
    title: "เคาน์เตอร์คิดเงินสไตล์โมเดิร์น ไฟ LED",
    category: "เคาน์เตอร์",
    group: "อุปกรณ์หน้าร้าน",
    badge: "COUNTER",
    highlight: "★ ยอดนิยม",
    price: 11500,
    stock: 7,
    rating: 4.9,
    updatedText: "5 ชั่วโมงที่แล้ว",
    image: "assets/images/checkout-counter.svg",
    description:
      "เคาน์เตอร์แคชเชียร์ไม้ลามิเนตดำด้าน ทนรอยขีดข่วน มีช่องร้อยสาย POS และไฟซ่อน LED ใต้ฐาน"
  },
  {
    id: "cart-01",
    title: "ชุดตะกร้าช้อปปิ้ง + รถเข็นสแตนเลส",
    category: "ชั้นวางสินค้า",
    group: "อุปกรณ์หน้าร้าน",
    badge: "CART",
    highlight: "★ ครบชุด",
    price: 2450,
    stock: 50,
    rating: 4.7,
    updatedText: "1 วันที่แล้ว",
    image: "assets/images/shopping-cart.svg",
    description:
      "รถเข็นช้อปปิ้งสแตนเลส 100 ลิตร ล้อยางเงียบพิเศษ พร้อมตะกร้าถือพลาสติกเกรดหนาซ้อนเก็บได้"
  },
  {
    id: "led-01",
    title: "ป้ายไฟ LED Open + จอเมนูหน้าร้าน",
    category: "ไฟ & ป้ายร้าน",
    group: "อุปกรณ์หน้าร้าน",
    badge: "SIGNAGE",
    highlight: "★ เด่นชัด",
    price: 1890,
    stock: 22,
    rating: 4.8,
    updatedText: "1 วันที่แล้ว",
    image: "assets/images/led-sign.svg",
    description:
      "ป้ายไฟนีออน LED ประหยัดพลังงาน เห็นชัดทั้งกลางวันและกลางคืน เพิ่มความโดดเด่นให้หน้าร้านของคุณ"
  }
];
