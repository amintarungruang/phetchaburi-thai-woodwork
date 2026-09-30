export type Language = 'th' | 'en';

export interface Translations {
  common: {
    callNow: string;
    callArtisan: string;
    viewAll: string;
    close: string;
    search: string;
    filter: string;
    details: string;
    all: string;
    customDimensions: string;
    loading: string;
    submittedSuccess: string;
    errorOccurred: string;
    phoneLabel: string;
    lineIdLabel: string;
    nameLabel: string;
    baht: string;
    meter: string;
  };
  navbar: {
    brandTitle: string;
    brandSubtitle: string;
    brandTagline: string;
    home: string;
    portfolio: string;
    feed: string;
    map: string;
    schedule: string;
    estimator: string;
    callButton: string;
    callArtisanFull: string;
    langSwitch: string;
  };
  hero: {
    badge: string;
    titleLine1: string;
    titleLine2: string;
    subtitleLine1: string;
    subtitleLine2: string;
    subtitle: string;
    ctaEstimate: string;
    ctaPortfolio: string;
  };
  thaiHouse: {
    badge: string;
    titleLine1: string;
    titleLine2: string;
    desc: string;
    modelCaption: string;
    modelBadge: string;
    modelCustom: string;
    catalogLink: string;
    callLink: string;
    highlights: {
      title: string;
      desc: string;
    }[];
  };
  craftsmanship: {
    badge: string;
    title: string;
    desc: string;
    steps: {
      step: string;
      title: string;
      desc: string;
      badge: string;
    }[];
    promiseTitle: string;
    promiseDesc: string;
  };
  portfolio: {
    badge: string;
    title: string;
    desc: string;
    allTab: string;
    searchPlaceholder: string;
    noResults: string;
    viewAllButton: string;
    showLessButton: string;
    viewDetails: string;
    projectYear: string;
    location: string;
    woodType: string;
    technique: string;
    dimensions: string;
    callForPrice: string;
    lightboxClose: string;
    imageCounter: string;
  };
  feed: {
    badge: string;
    title: string;
    desc: string;
    allTab: string;
    readMore: string;
    postedOn: string;
    noPosts: string;
    modalTitle: string;
    closeModal: string;
    tagLabel: string;
  };
  map: {
    badge: string;
    title: string;
    desc: string;
    provincesCovered: string;
    projectsDelivered: string;
    guaranteeText: string;
    allProvinces: string;
    viewProject: string;
    woodDetail: string;
    completedYear: string;
    zoomHint: string;
    privateLocationNote: string;
  };
  schedule: {
    badge: string;
    title: string;
    desc: string;
    queueAvailable: string;
    queueBusy: string;
    queueInProduction: string;
    queueInstallation: string;
    bookQueueCta: string;
    callToBook: string;
    monthNames: string[];
    daysOfWeek: string[];
    currentMonth: string;
    selectedDateInfo: string;
  };
  estimator: {
    badge: string;
    title: string;
    subtitle: string;
    step1Title: string;
    step2Title: string;
    step3Title: string;
    step4Title: string;
    workTypeLabel: string;
    woodGradeLabel: string;
    carvingLabel: string;
    dimensionsLabel: string;
    widthLabel: string;
    heightLabel: string;
    quantityLabel: string;
    estimatedBudget: string;
    estimateDisclaimer: string;
    formTitle: string;
    formDesc: string;
    namePlaceholder: string;
    phonePlaceholder: string;
    linePlaceholder: string;
    submitLeadBtn: string;
    submittingBtn: string;
    successTitle: string;
    successDesc: string;
    consultBtn: string;
    calculateAnother: string;
  };
  chatbot: {
    botName: string;
    botRole: string;
    welcomeMessage: string;
    inputPlaceholder: string;
    sendBtn: string;
    quickRepliesTitle: string;
    typing: string;
    callArtisanDirect: string;
    formPrompt: string;
    namePlaceholder: string;
    phonePlaceholder: string;
    linePlaceholder: string;
    interestPlaceholder: string;
    submitFormBtn: string;
    formSuccess: string;
  };
  floating: {
    callTitle: string;
    chatTitle: string;
    chatPrompt: string;
  };
  footer: {
    about: string;
    customServicesTitle: string;
    customServices: string[];
    contactTitle: string;
    address: string;
    openHours: string;
    callUs: string;
    rightsReserved: string;
    privacyPolicy: string;
  };
  cookieBanner: {
    title: string;
    desc: string;
    acceptAll: string;
    necessaryOnly: string;
    learnMore: string;
  };
  privacyPolicy: {
    title: string;
    lastUpdated: string;
    sections: {
      title: string;
      content: string;
    }[];
    closeBtn: string;
  };
}

export const translations: Record<Language, Translations> = {
  th: {
    common: {
      callNow: 'โทรเลย',
      callArtisan: 'โทรคุยกับช่าง',
      viewAll: 'ดูทั้งหมด',
      close: 'ปิด',
      search: 'ค้นหา...',
      filter: 'ตัวกรอง',
      details: 'รายละเอียด',
      all: 'ทั้งหมด',
      customDimensions: 'สั่งทำตามขนาดหน้างาน',
      loading: 'กำลังโหลด...',
      submittedSuccess: 'ส่งข้อมูลเรียบร้อยแล้ว ช่างจะติดต่อกลับโดยเร็วที่สุด',
      errorOccurred: 'เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง',
      phoneLabel: 'เบอร์โทรศัพท์',
      lineIdLabel: 'LINE ID',
      nameLabel: 'ชื่อผู้ติดต่อ',
      baht: 'บาท',
      meter: 'ม.',
    },
    navbar: {
      brandTitle: 'ฝาทรงไทย',
      brandSubtitle: 'ไม้สัก เพชรบุรี',
      brandTagline: 'คุณภาพงานช่างเมืองเพชรบุรี',
      home: 'หน้าแรก',
      portfolio: 'ผลงานของเรา',
      feed: 'ข่าวสาร & อัปเดต',
      map: 'แผนที่ผลงาน',
      schedule: 'ตารางคิวงาน',
      estimator: 'คำนวณราคา',
      callButton: 'โทร 084-042-6571',
      callArtisanFull: 'โทรปรึกษาช่าง: 084-042-6571',
      langSwitch: 'ภาษา',
    },
    hero: {
      badge: 'คุณภาพงานช่างเมืองเพชรบุรี',
      titleLine1: 'บริการงานไม้สักครบวงจร',
      titleLine2: 'จากฝีมือช่างเมืองเพชร',
      subtitleLine1: 'รับผลิตฝาทรงไทย หน้าจั่ว วงกบ ประตู หน้าต่างและอื่นๆ',
      subtitleLine2: 'งานไม้คุณภาพสูง ควบคุมการผลิตจากโรงงานโดยตรง',
      subtitle: 'รับผลิตฝาทรงไทย หน้าจั่ว วงกบ ประตู หน้าต่างและอื่นๆ งานไม้คุณภาพสูง ควบคุมการผลิตจากโรงงานโดยตรง',
      ctaEstimate: 'คำนวณงบประมาณคร่าวๆ',
      ctaPortfolio: 'ชมผลงานล่าสุด',
    },
    thaiHouse: {
      badge: 'แบบจำลองสถาปัตยกรรมเรือนไทยเมืองเพชร',
      titleLine1: 'เชี่ยวชาญงานฝาเรือนไทย',
      titleLine2: 'โครงจั่วเพชรบุรี และงานประกอบติดตั้ง',
      desc: 'โรงงานเราเน้นงานฝาเรือนไทย ฝาปะกน ลูกฟัก ลายรัดเอว และโครงจั่วเพชรบุรีตามแบบประเพณี เข้าลิ้นเดือยไม้โบราณไม่ใช้ตะปู พร้อมรับสั่งทำงานไม้ทุกชนิด ทั้งประตู โต๊ะ ระเบียง มีไม้สัก ไม้สะเดา ไม้ตะแบก ให้เลือกตามงบประมาณ หรือจะนำไม้มาเองให้ช่างคิดแต่ค่าแรงก็ได้ครับ',
      modelCaption: 'เข้าลิ้นเดือยไม้โบราณ • ฝาปะกนลูกฟักลายรัดเอว',
      modelBadge: 'แบบจำลองสถาปัตยกรรมเรือนไทยเมืองเพชร',
      modelCustom: 'สั่งทำได้ทุกขนาดตามสั่ง',
      catalogLink: 'ดูแคตตาล็อกผลงานทั้งหมด',
      callLink: 'โทรคุยกับช่างเอส: 084-042-6571',
      highlights: [
        {
          title: 'งานฝาเรือนไทย ฝาปะกน ลูกฟัก ลายรัดเอว',
          desc: 'เข้าลิ้นเดือยไม้โบราณเมืองเพชรบุรี ร่องประกบแนบสนิท แข็งแรง ไม่ปริแยกตามฤดูกาล',
        },
        {
          title: 'โครงจั่วเพชรบุรี และทรงปั้นหยา',
          desc: 'ขึ้นโครงจั่วสัดส่วนงาม เข้าเดือยแน่นหนา รองรับแรงลมและสภาพแดดฝนเมืองไทยได้จริง',
        },
        {
          title: 'ประกอบยกแผง พร้อมช่างติดตั้งถึงหน้างาน',
          desc: 'ประกอบชิ้นงานเป็นแผงจากโรงงาน ขนส่งและทีมช่างโรงงานขึ้นติดตั้งให้จริง ไม่จ้างผู้รับเหมาช่วง',
        },
        {
          title: 'เลือกชนิดไม้ได้ตามงบ หรือนำไม้มาเองได้',
          desc: 'มีทั้งไม้สัก ไม้สะเดา ไม้ตะแบก/ไม้เนื้อแข็ง หรือลูกค้านำไม้มาเอง คิดเฉพาะค่าแรงช่างจริงใจ',
        },
      ],
    },
    craftsmanship: {
      badge: 'ขั้นตอนมาตรฐานโรงงานช่างเพชร',
      title: 'งานประณีต เข้าลิ้นเดือยไม้โบราณ แข็งแรงส่งต่อรุ่นสู่รุ่น',
      desc: 'ทุกชิ้นงานผ่านการคัดไม้ อบแห้ง และเข้าลิ้นเดือยไม้โดยช่างเมืองเพชรบุรี เพื่อความทนทานและความวิจิตรตามแบบประเพณี',
      steps: [
        {
          step: '01',
          title: 'พูดคุยแบบ & เลือกไม้ตามงบ',
          desc: 'ปรึกษาขนาด สัดส่วนหน้างาน และงบประมาณ มีเนื้อไม้ให้เลือกทั้งไม้สัก ไม้สะเดา ไม้ตะแบก หรือมีไม้มาเอง ตีราคาตามจริง',
          badge: 'ช่างตีราคาตรงไปตรงมา',
        },
        {
          step: '02',
          title: 'คัดไม้ แปรรูป & อบแห้ง',
          desc: 'คัดเนื้อไม้คุณภาพ ผ่านการผึ่งและเข้าเตาอบควบคุมความชื้นมาตรฐาน เพื่อป้องกันไม้บิด โก่ง หรือปริแตกตามสภาพอากาศ',
          badge: 'ไม้ไม่หด ไม่บิดตัว',
        },
        {
          step: '03',
          title: 'เข้าลิ้นลูกฟัก & โครงจั่ว',
          desc: 'เข้าลิ้นเดือยไม้ลูกฟัก ลายรัดเอว และโครงจั่วเพชรบุรี/ปั้นหยา เข้าเดือยไม้โบราณแนบสนิท แข็งแรงทนทาน ไร้ตะปู',
          badge: 'สัดส่วนช่างเพชรบุรีแท้',
        },
        {
          step: '04',
          title: 'ประกอบยกแผง & ช่างติดตั้งถึงที่',
          desc: 'ประกอบชิ้นงานเป็นแผงสำเร็จรูปจากโรงงาน ขนส่งอย่างระมัดระวัง พร้อมทีมช่างของโรงงานขึ้นติดตั้งให้จริงหน้างานทั่วประเทศ',
          badge: 'ช่างโรงงานติดตั้งเอง',
        },
      ],
      promiseTitle: 'รับประกันงานเข้าลิ้นเดือยไม้ และบริการหลังส่งมอบจริงใจ',
      promiseDesc: 'เราดูแลให้คำปรึกษาตลอดอายุการใช้งาน ให้ความมั่นใจในทุกแผงฝาและทุกโครงสร้าง',
    },
    portfolio: {
      badge: 'Masterpiece Portfolio',
      title: 'แคตตาล็อกผลงานของเรา',
      desc: 'งานฝาเรือนไทย ฝาปะกน ลูกฟัก โครงจั่วเพชรบุรี และงานไม้สั่งทำตามแบบ ส่งมอบและประกอบติดตั้งจริงถึงหน้างาน',
      allTab: 'ทั้งหมด',
      searchPlaceholder: 'ค้นหาชื่อผลงาน, ไม้สัก, สถานที่...',
      noResults: 'ไม่พบผลงานในหมวดหมู่นี้',
      viewAllButton: 'ดูผลงานทั้งหมด',
      showLessButton: 'ย่อผลงานลง',
      viewDetails: 'ดูภาพและรายละเอียด',
      projectYear: 'ปีที่ติดตั้ง',
      location: 'สถานที่ติดตั้ง',
      woodType: 'ชนิดไม้',
      technique: 'เทคนิคงานช่าง',
      dimensions: 'ขนาดชิ้นงาน',
      callForPrice: 'สอบถามราคาชิ้นงานนี้',
      lightboxClose: 'ปิดหน้าต่าง',
      imageCounter: 'รูปที่',
    },
    feed: {
      badge: 'Factory Updates & Stories',
      title: 'ข่าวสาร & ความคืบหน้าจากโรงงาน',
      desc: 'ติดตามขั้นตอนการคัดไม้ การเข้าเดือย และภาพการติดตั้งจริงจากหน้างานทั่วประเทศ',
      allTab: 'ทั้งหมด',
      readMore: 'อ่านบันทึกช่างฉบับเต็ม',
      postedOn: 'เผยแพร่เมื่อ',
      noPosts: 'ไม่มีบทความในหมวดหมู่นี้',
      modalTitle: 'บันทึกช่างไม้เพชรบุรี',
      closeModal: 'ปิดหน้าต่าง',
      tagLabel: 'แท็กหมวดหมู่',
    },
    map: {
      badge: 'Nationwide Delivery',
      title: 'แผนที่ผลงานที่ติดตั้งจริงทั่วไทย',
      desc: 'ส่งมอบและประกอบติดตั้งงานฝาเรือนไทยและงานไม้ประเพณีทั่วทุกภาคของประเทศไทย',
      provincesCovered: 'จังหวัดที่ส่งมอบแล้ว',
      projectsDelivered: 'ผลงานติดตั้งเสร็จสมบูรณ์',
      guaranteeText: 'ช่างโรงงานเดินทางไปประกอบติดตั้งหน้างานจริงทั่วประเทศ',
      allProvinces: 'ทุกจังหวัด',
      viewProject: 'ดูรายละเอียดผลงาน',
      woodDetail: 'ชนิดไม้',
      completedYear: 'ปีที่ส่งมอบ',
      zoomHint: 'คลิกหมุดบนแผนที่เพื่อดูภาพผลงานในแต่ละจังหวัด',
      privateLocationNote: 'หมายเหตุ: สำหรับผลงานที่เป็นสถานที่ส่วนบุคคล ทางโรงงานจะระบุเพียงชื่ออำเภอหรือจังหวัดเท่านั้น เพื่อความเป็นส่วนตัวของเจ้าของสถานที่',
    },
    schedule: {
      badge: 'Factory Queue & Availability',
      title: 'ตารางคิวผลิต & นัดหมายติดตั้ง',
      desc: 'ตรวจสอบคิวงานว่างของโรงงานล่วงหน้า เพื่อวางแผนสั่งผลิตและติดตั้งได้ทันตามกำหนดการของท่าน',
      queueAvailable: 'คิวว่าง รับงานได้',
      queueBusy: 'คิวเต็ม',
      queueInProduction: 'กำลังขึ้นงานในโรงงาน',
      queueInstallation: 'ช่างออกติดตั้งหน้างาน',
      bookQueueCta: 'สนใจจองคิวผลิตช่วงนี้?',
      callToBook: 'โทรล็อกคิวช่าง: 084-042-6571',
      monthNames: [
        'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
        'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
      ],
      daysOfWeek: ['อา.', 'จ.', 'อ.', 'พ.', 'พฤ.', 'ศ.', 'ส.'],
      currentMonth: 'เดือนปัจจุบัน',
      selectedDateInfo: 'ข้อมูลคิวงานประจำวันที่',
    },
    estimator: {
      badge: 'Instant Budget Estimator',
      title: 'โปรแกรมคำนวณงบประมาณคร่าวๆ',
      subtitle: 'เลือกรูปแบบงานไม้ ชนิดไม้ และระบุขนาดหน้างาน เพื่อประเมินราคาช่างเบื้องต้นได้ทันที',
      step1Title: '1. เลือกประเภทงานไม้',
      step2Title: '2. เลือกชนิดไม้ & เกรด',
      step3Title: '3. ระดับความประณีต/งานแกะสลัก',
      step4Title: '4. ระบุขนาดและจำนวน',
      workTypeLabel: 'ประเภทงาน',
      woodGradeLabel: 'ชนิดไม้',
      carvingLabel: 'การเข้าลิ้น / งานแกะ',
      dimensionsLabel: 'ขนาดและจำนวน',
      widthLabel: 'ความกว้าง (เมตร)',
      heightLabel: 'ความสูง (เมตร)',
      quantityLabel: 'จำนวน (ชุด/แผง)',
      estimatedBudget: 'งบประมาณประเมินเบื้องต้น',
      estimateDisclaimer: '* ราคาประเมินนี้เป็นราคาคร่าวๆ อาจปรับเปลี่ยนตามสัดส่วน รายละเอียดลวดลาย และระยะทางขนส่งหน้างานจริง',
      formTitle: 'ส่งข้อมูลให้ช่างเอสตีราคาประเมินจริง',
      formDesc: 'กรอกเบอร์โทรศัพท์ เพื่อให้ช่างติดต่อกลับพร้อมสรุปราคาที่แน่นอนและคำแนะนำเรื่องเนื้อไม้',
      namePlaceholder: 'ชื่อของคุณ (เช่น คุณสมชาย)',
      phonePlaceholder: 'เบอร์โทรศัพท์ติดต่อ (เช่น 081-xxx-xxxx)',
      linePlaceholder: 'LINE ID (ถ้ามี)',
      submitLeadBtn: 'ส่งข้อมูลให้ช่างประเมินราคาจริง',
      submittingBtn: 'กำลังส่งข้อมูล...',
      successTitle: 'ส่งข้อมูลเรียบร้อยแล้ว!',
      successDesc: 'ช่างเอสได้รับข้อมูลการประเมินราคาของท่านแล้ว จะรีบติดต่อกลับเพื่อแจ้งราคาและคุยรายละเอียดครับ',
      consultBtn: 'โทรคุยกับช่างทันที: 084-042-6571',
      calculateAnother: 'คำนวณรายการอื่นเพิ่ม',
    },
    chatbot: {
      botName: 'น้องไทยบอท',
      botRole: 'ผู้ช่วยโรงงานฝาทรงไทยเมืองเพชร',
      welcomeMessage: 'สวัสดีครับ! ผมน้องไทยบอท ผู้ช่วยช่างเอส ยินดีให้คำปรึกษางานฝาเรือนไทย โครงจั่วเพชรบุรี ชนิดไม้ และงบประมาณครับ สนใจเรื่องไหนเลือกหรือพิมพ์ถามได้เลยครับ!',
      inputPlaceholder: 'พิมพ์คำถาม เช่น ราคาฝาปะกน, ไม้สักทอง, ค่าช่าง...',
      sendBtn: 'ส่ง',
      quickRepliesTitle: 'หัวข้อที่ลูกค้าถามบ่อย:',
      typing: 'น้องไทยบอทกำลังพิมพ์...',
      callArtisanDirect: 'โทรคุยกับช่างเอสโดยตรง',
      formPrompt: 'ต้องการให้ช่างติดต่อกลับประเมินราคา กรอกข้อมูลด้านล่างได้เลยครับ:',
      namePlaceholder: 'ชื่อของคุณ',
      phonePlaceholder: 'เบอร์โทรศัพท์',
      linePlaceholder: 'LINE ID (ไม่บังคับ)',
      interestPlaceholder: 'งานที่สนใจ',
      submitFormBtn: 'ส่งข้อมูลให้ช่างติดต่อกลับ',
      formSuccess: 'ขอบคุณครับ! ช่างเอสได้รับข้อมูลแล้วจะติดต่อกลับโดยเร็วที่สุดครับ',
    },
    floating: {
      callTitle: 'โทรสายตรงช่างเอส',
      chatTitle: 'คุยกับน้องไทยบอท',
      chatPrompt: 'คุยกับน้องไทยบอท ทักได้เลยครับ!',
    },
    footer: {
      about: 'รับสั่งทำสถาปัตยกรรมไม้สัก หน้าจั่ว ประตูแกะสลัก วงกบ และฝาปะกน ฝีมือช่างไม้เมืองเพชรบุรี ส่งมอบงานคุณภาพสูงทั่วประเทศ',
      customServicesTitle: 'งานสั่งทำ',
      customServices: [
        '• หน้าจั่วทรงไทย ลายกนกเปลวเพลิง',
        '• ประตูไม้สักแกะสลัก ลายทวารบาล',
        '• ชุดวงกบและช่องแสงลูกฟักโบราณ',
        '• ฝาปะกนเรือนไทยสำเร็จรูป',
        '• ศาลาทรงไทยไม้สัก',
      ],
      contactTitle: 'ข้อมูลติดต่อโรงงาน',
      address: 'อ.บ้านลาด จ.เพชรบุรี (คลิกเปิด Google Maps)',
      openHours: 'จันทร์ - เสาร์: 08:00 - 17:00 น.',
      callUs: '084-042-6571 (ช่างเอส)',
      rightsReserved: 'ฝาทรงไทย ไม้สัก เพชรบุรี. All rights reserved.',
      privacyPolicy: 'นโยบายความเป็นส่วนตัว',
    },
    cookieBanner: {
      title: 'นโยบายการใช้คุกกี้ (Cookie Policy)',
      desc: 'เว็บไซต์นี้ใช้คุกกี้เพื่อมอบประสบการณ์การใช้งานที่ดีที่สุดและจดจำการตั้งค่าการใช้งานของท่าน',
      acceptAll: 'ยอมรับทั้งหมด',
      necessaryOnly: 'เฉพาะที่จำเป็น',
      learnMore: 'อ่านนโยบายความเป็นส่วนตัว',
    },
    privacyPolicy: {
      title: 'นโยบายความเป็นส่วนตัว (Privacy Policy)',
      lastUpdated: 'ปรับปรุงล่าสุด: กันยายน 2569',
      sections: [
        {
          title: '1. ข้อมูลที่เราจัดเก็บ',
          content: 'เราจัดเก็บข้อมูลที่ท่านให้ไว้เมื่อติดต่อสอบถามหรือขอใบเสนอราคา ได้แก่ ชื่อ เบอร์โทรศัพท์ LINE ID และข้อมูลรายละเอียดเกี่ยวกับชิ้นงานไม้ที่ท่านสนใจ',
        },
        {
          title: '2. วัตถุประสงค์การใช้งาน',
          content: 'ข้อมูลของท่านจะถูกใช้เพื่อการติดต่อกลับ ชี้แจงรายละเอียด เสนอราคา ประสานงานการผลิต และการจัดส่งติดตั้งชิ้นงานเท่านั้น จะไม่มีการนำข้อมูลไปจำหน่ายหรือส่งต่อแก่บุคคลภายนอก',
        },
        {
          title: '3. ความปลอดภัยของข้อมูล',
          content: 'เรามีมาตรการรักษาความปลอดภัยของข้อมูลส่วนบุคคลตามมาตรฐาน พ.ร.บ. คุ้มครองข้อมูลส่วนบุคคล (PDPA)',
        },
      ],
      closeBtn: 'เข้าใจแล้วและปิดหน้านี้',
    },
  },
  en: {
    common: {
      callNow: 'Call Now',
      callArtisan: 'Call Artisan',
      viewAll: 'View All',
      close: 'Close',
      search: 'Search...',
      filter: 'Filter',
      details: 'Details',
      all: 'All',
      customDimensions: 'Custom Made to Measurements',
      loading: 'Loading...',
      submittedSuccess: 'Inquiry sent successfully! Master Artisan S will get back to you shortly.',
      errorOccurred: 'An error occurred. Please try again.',
      phoneLabel: 'Phone Number',
      lineIdLabel: 'LINE ID',
      nameLabel: 'Contact Name',
      baht: 'THB',
      meter: 'm',
    },
    navbar: {
      brandTitle: 'Thai Heritage Woodcraft',
      brandSubtitle: 'Phetchaburi Teak',
      brandTagline: 'Authentic Craftsmanship from Phetchaburi',
      home: 'Home',
      portfolio: 'Portfolio',
      feed: 'Updates & News',
      map: 'Delivery Map',
      schedule: 'Production Queue',
      estimator: 'Cost Estimator',
      callButton: 'Call 084-042-6571',
      callArtisanFull: 'Consult Master Artisan: 084-042-6571',
      langSwitch: 'Language',
    },
    hero: {
      badge: 'Authentic Phetchaburi Craftsmanship',
      titleLine1: 'Comprehensive Teak Woodwork Services',
      titleLine2: 'Handcrafted by Phetchaburi Master Artisans',
      subtitleLine1: 'Specializing in traditional Thai wall panels, gables, door/window frames, and custom woodcraft',
      subtitleLine2: 'Premium quality timber with direct factory production control',
      subtitle: 'Specializing in traditional Thai wall panels, gables, door/window frames, and custom woodcraft. Premium quality timber with direct factory production control.',
      ctaEstimate: 'Estimate Project Budget',
      ctaPortfolio: 'Explore Masterpieces',
    },
    thaiHouse: {
      badge: 'Scale Model of Phetchaburi Architecture',
      titleLine1: 'Mastery in Traditional Thai Walls',
      titleLine2: 'Phetchaburi Gables & On-Site Assembly',
      desc: 'Our workshop specializes in authentic Fa Pakon wall panels, waist-molded friezes, and traditional Phetchaburi gables crafted with ancient mortise-and-tenon joinery—no nails used. We also build custom doors, tables, and balustrades using Teak, Neem, or Crape Myrtle, or crafted from your own supplied timber.',
      modelCaption: 'Ancient Mortise & Tenon Joinery • Traditional Fa Pakon Wall Panels',
      modelBadge: 'Traditional Phetchaburi House Scale Model',
      modelCustom: 'Custom Made to Any Dimensions',
      catalogLink: 'Explore Full Masterpiece Catalog',
      callLink: 'Direct Line to Master S: 084-042-6571',
      highlights: [
        {
          title: 'Fa Pakon Traditional Walls & Waist-Molded Panels',
          desc: 'Ancient interlocking tongue-and-groove jointing technique of Phetchaburi. Snug, sturdy, and resistant to seasonal expansion.',
        },
        {
          title: 'Authentic Phetchaburi Gables & Hip Roof Structures',
          desc: 'Engineered with classic proportions and robust jointing to withstand strong winds and tropical monsoons.',
        },
        {
          title: 'Modular Prefabrication & On-Site Factory Installation',
          desc: 'Components are prefabricated at our factory and delivered. Our own skilled carpenters handle on-site assembly nationwide—no subcontractors.',
        },
        {
          title: 'Choose Wood by Budget or Bring Your Own Timber',
          desc: 'Options include Golden Teak, Neem, and Crape Myrtle hardwoods, or bring your own wood and pay transparent artisan labor rates.',
        },
      ],
    },
    craftsmanship: {
      badge: 'Phetchaburi Workshop Standard',
      title: 'Exquisite Heritage Joinery Built to Last for Generations',
      desc: 'Every piece is hand-selected, kiln-dried to precision, and fitted with ancient interlocking tenons by seasoned Phetchaburi woodworkers.',
      steps: [
        {
          step: '01',
          title: 'Design Consultation & Timber Selection',
          desc: 'Discuss dimensions, proportions, and budget. Choose between Teak, Neem, Crape Myrtle, or provide your own timber with fair artisan rates.',
          badge: 'Transparent Direct Pricing',
        },
        {
          step: '02',
          title: 'Wood Selection, Milling & Kiln-Drying',
          desc: 'Selected timber is scientifically seasoned and kiln-dried under controlled humidity standards to eliminate warping, shrinking, and splitting.',
          badge: 'Anti-Warping Guarantee',
        },
        {
          step: '03',
          title: 'Interlocking Mortise & Tenon Assembly',
          desc: 'Panels, waist friezes, and gables are locked using ancient nail-free wooden dowels and tenons for structural integrity and timeless beauty.',
          badge: 'Authentic Phetchaburi Proportions',
        },
        {
          step: '04',
          title: 'Modular Assembly & Nationwide Installation',
          desc: 'Panels are prefabricated into modular sections and carefully delivered. Our in-house artisan team handles complete on-site installation across Thailand.',
          badge: 'Factory Team Installed',
        },
      ],
      promiseTitle: 'Guaranteed Heritage Joinery & Dedicated After-Sales Care',
      promiseDesc: 'We stand behind every modular panel and structure with lifelong care and honest craft guidance.',
    },
    portfolio: {
      badge: 'Masterpiece Portfolio',
      title: 'Our Masterpiece Catalog',
      desc: 'Traditional Thai wall panels, Phetchaburi gables, custom doors, and bespoke architectural woodwork delivered and assembled on-site.',
      allTab: 'All Works',
      searchPlaceholder: 'Search projects, teak, location...',
      noResults: 'No projects found in this category',
      viewAllButton: 'View All Projects',
      showLessButton: 'Show Less',
      viewDetails: 'View Photos & Details',
      projectYear: 'Installation Year',
      location: 'Site Location',
      woodType: 'Wood Type',
      technique: 'Craft Technique',
      dimensions: 'Dimensions',
      callForPrice: 'Inquire About This Work',
      lightboxClose: 'Close Viewer',
      imageCounter: 'Photo',
    },
    feed: {
      badge: 'Factory Updates & Stories',
      title: 'Factory News & Workshop Logs',
      desc: 'Follow our daily timber grading, tenon jointing, and on-site assembly milestones across Thailand.',
      allTab: 'All Stories',
      readMore: 'Read Full Artisan Log',
      postedOn: 'Published on',
      noPosts: 'No updates found in this category',
      modalTitle: 'Phetchaburi Artisan Chronicle',
      closeModal: 'Close Window',
      tagLabel: 'Category Tag',
    },
    map: {
      badge: 'Nationwide Delivery',
      title: 'Completed Installations Across Thailand',
      desc: 'Delivering and installing authentic Thai architectural woodcraft in every region of Thailand.',
      provincesCovered: 'Provinces Delivered',
      projectsDelivered: 'Completed Installations',
      guaranteeText: 'Our factory carpenter team travels nationwide for genuine on-site installation',
      allProvinces: 'All Provinces',
      viewProject: 'View Project Details',
      woodDetail: 'Timber Species',
      completedYear: 'Completion Year',
      zoomHint: 'Click on pins to inspect completed woodwork in each province',
      privateLocationNote: '* Note: For projects installed at private residences or personal properties, only the district or province is indicated to respect client privacy.',
    },
    schedule: {
      badge: 'Factory Queue & Availability',
      title: 'Production & Installation Schedule',
      desc: 'Check available workshop production and installation slots in advance to reserve your preferred timeframe.',
      queueAvailable: 'Slot Available',
      queueBusy: 'Fully Booked',
      queueInProduction: 'Workshop Production Active',
      queueInstallation: 'On-Site Team Deployed',
      bookQueueCta: 'Looking to reserve an upcoming slot?',
      callToBook: 'Call to Reserve Slot: 084-042-6571',
      monthNames: [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
      ],
      daysOfWeek: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
      currentMonth: 'Current Month',
      selectedDateInfo: 'Schedule Details for',
    },
    estimator: {
      badge: 'Instant Budget Estimator',
      title: 'Instant Woodwork Budget Estimator',
      subtitle: 'Select your preferred woodwork type, timber species, and specify site dimensions to get an instant cost estimate.',
      step1Title: '1. Select Work Type',
      step2Title: '2. Select Wood Species & Grade',
      step3Title: '3. Craft Detail & Carving Level',
      step4Title: '4. Specify Dimensions & Quantity',
      workTypeLabel: 'Work Category',
      woodGradeLabel: 'Wood Type',
      carvingLabel: 'Detail & Carving',
      dimensionsLabel: 'Dimensions & Quantity',
      widthLabel: 'Width (meters)',
      heightLabel: 'Height (meters)',
      quantityLabel: 'Quantity (sets/panels)',
      estimatedBudget: 'Estimated Budget Range',
      estimateDisclaimer: '* Estimated price is for budgeting purposes. Final quote may vary slightly based on specific motif complexity and delivery distance.',
      formTitle: 'Request an Official Quote from Master Artisan S',
      formDesc: 'Submit your contact details and Master S will follow up with an accurate quote and timber recommendations.',
      namePlaceholder: 'Your Name (e.g. John Doe)',
      phonePlaceholder: 'Phone Number (e.g. 081-xxx-xxxx)',
      linePlaceholder: 'LINE ID (optional)',
      submitLeadBtn: 'Request Official Artisan Quote',
      submittingBtn: 'Submitting Inquiry...',
      successTitle: 'Inquiry Submitted Successfully!',
      successDesc: 'Master Artisan S has received your request and will contact you shortly with full details.',
      consultBtn: 'Direct Call to Master S: 084-042-6571',
      calculateAnother: 'Estimate Another Item',
    },
    chatbot: {
      botName: 'ThaiBot',
      botRole: 'Phetchaburi Woodcraft AI Assistant',
      welcomeMessage: 'Hello! I am ThaiBot, assistant to Master Artisan S. I can help answer questions regarding traditional Thai walls, Phetchaburi gables, timber types, and pricing. Feel free to choose an option or type your question below!',
      inputPlaceholder: 'Type a question e.g. Fa Pakon price, Golden Teak, lead time...',
      sendBtn: 'Send',
      quickRepliesTitle: 'Frequently Asked Topics:',
      typing: 'ThaiBot is typing...',
      callArtisanDirect: 'Direct Call to Master Artisan S',
      formPrompt: 'Would you like Master S to contact you with a formal quote? Please leave your details below:',
      namePlaceholder: 'Your Name',
      phonePlaceholder: 'Phone Number',
      linePlaceholder: 'LINE ID (optional)',
      interestPlaceholder: 'Area of Interest',
      submitFormBtn: 'Submit Inquiry',
      formSuccess: 'Thank you! Master Artisan S has received your message and will reach out shortly.',
    },
    floating: {
      callTitle: 'Call Master Artisan S',
      chatTitle: 'Chat with ThaiBot',
      chatPrompt: 'Chat with ThaiBot anytime!',
    },
    footer: {
      about: 'Specialized in authentic Thai teak architecture, gables, carved doors, doorframes, and modular Fa Pakon wall panels crafted by Phetchaburi artisans.',
      customServicesTitle: 'Custom Services',
      customServices: [
        '• Traditional Thai Gables with Flame Kanok motifs',
        '• Hand-Carved Teak Doors with Guardian motifs',
        '• Heritage Doorframes and Transom panels',
        '• Modular Fa Pakon Traditional Wall Panels',
        '• Teak Traditional Gazebos & Pavilions',
      ],
      contactTitle: 'Workshop Contact Information',
      address: 'Ban Lat District, Phetchaburi Province (Open in Google Maps)',
      openHours: 'Mon - Sat: 08:00 - 17:00',
      callUs: '084-042-6571 (Master Artisan S)',
      rightsReserved: 'Thai Heritage Woodcraft • Phetchaburi Teak. All rights reserved.',
      privacyPolicy: 'Privacy Policy',
    },
    cookieBanner: {
      title: 'Cookie Policy',
      desc: 'This website uses cookies to optimize your browsing experience and remember your preferences.',
      acceptAll: 'Accept All',
      necessaryOnly: 'Necessary Only',
      learnMore: 'Read Privacy Policy',
    },
    privacyPolicy: {
      title: 'Privacy Policy',
      lastUpdated: 'Last updated: September 2026',
      sections: [
        {
          title: '1. Information We Collect',
          content: 'We collect information you provide when requesting price estimates or consultations, such as name, phone number, LINE ID, and specific project specifications.',
        },
        {
          title: '2. Purpose of Use',
          content: 'Your information is used strictly for follow-up consultations, accurate quoting, and project delivery coordination. We never sell or distribute your data to third parties.',
        },
        {
          title: '3. Data Security',
          content: 'We maintain standard data protection safeguards in compliance with Personal Data Protection Act (PDPA) regulations.',
        },
      ],
      closeBtn: 'Understood & Close',
    },
  },
};
