import type { Place } from "@/types";

export const mockPlaces: Place[] = [
  // North Region
  {
    id: "place-doi-inthanon",
    name: "ดอยอินทนนท์",
    location: "อำเภอจอมทอง",
    province: "เชียงใหม่",
    region: "north",
    description:
      "ยอดเขาที่สูงที่สุดในประเทศไทย จุดชมทะเลหมอก กิ่วแม่ปาน และเส้นทางศึกษาธรรมชาติบนดอยสูง",
    type: "mountain",
    isNationalPark: true,
    altitude: "2565 m",
    distance: "8.5 km",
    bestSeason:
      "เปิดให้บริการทุกวัน ช่วงที่ดีที่สุดคือ ต.ค. – ก.พ. (อากาศเย็น ทะเลหมอกสวย)",
    campingInfo: "มีลานกางเต็นท์ให้บริการภายในพื้นที่อุทยาน ต้องจองล่วงหน้า",
    latitude: 18.5327878,
    longitude: 98.5461701,
  },
  {
    id: "place-doi-chiang-dao",
    name: "ดอยหลวงเชียงดาว",
    location: "อำเภอเชียงดาว",
    province: "เชียงใหม่",
    region: "north",
    description:
      "ยอดหินปูนสูงชัน ต้องขออนุญาตเข้าเขตสงวน วิวเทือกเขาและดวงดาวบนสันดอย",
    type: "mountain",
    isNationalPark: true,
    altitude: "2225 m",
    distance: "5.2 km",
    bestSeason: "เปิดให้บริการทุกวัน ควรหลีกเลี่ยงช่วงฤดูฝน (มิ.ย. – ต.ค.)",
    campingInfo: "มีลานกางเต็นท์ให้บริการภายในพื้นที่อุทยาน",
    latitude: 19.3777134,
    longitude: 99.661175,
  },

  // Central Region
  {
    id: "place-khao-yai",
    name: "อุทยานแห่งชาติเขาใหญ่",
    location: "อำเภอปากช่อง",
    province: "นครราชสีมา",
    region: "central",
    description:
      "อุทยานแห่งชาติแห่งแรกของไทย เส้นทางเดินป่า น้ำตกเหวนรก และสัตว์ป่าในผืนป่ามรดกโลก",
    type: "national_park",
    altitude: "1350 m",
    distance: "15.0 km",

    latitude: 14.3259751,
    longitude: 101.5113421,
  },
  {
    id: "place-khao-sam-rok",
    name: "เขาสามร้อยยอด",
    location: "อำเภอปราณบุรี",
    province: "ประจวบคีรีขันธ์",
    region: "central",
    description: "เขาสามร้อยยอด ยอดเขาสวยงาม จุดชมวิวทะเล และอุทยานแห่งชาติ",
    type: "mountain",
    isNationalPark: true,
    altitude: "604 m",
    distance: "6.0 km",

    latitude: 12.2013677,
    longitude: 99.961136,
  },

  // South Region
  {
    id: "place-khao-sok",
    name: "อุทยานแห่งชาติเขาสก",
    location: "อำเภอพนม",
    province: "สุราษฎร์ธานี",
    region: "south",
    description:
      "ป่าดิบชื้นโบราณ อ่างเก็บน้ำเชี่ยวหลาน เขาหินปูนโผล่เหนือผิวน้ำ และเส้นทางศึกษาธรรมชาติ",
    type: "national_park",
    altitude: "960 m",
    distance: "12.0 km",

    latitude: 9.0686887,
    longitude: 98.637592,
  },
  {
    id: "place-phi-phi",
    name: "หมู่เกาะพีพี",
    location: "อำเภอเมือง",
    province: "กระบี่",
    region: "south",
    description: "หมู่เกาะพีพี เกาะสวยงาม หาดทรายขาว น้ำใส และถ้ำธรรมชาติ",
    type: "island",
    isNationalPark: true,
    altitude: "0 m",
    distance: "0.5 km",

    latitude: 7.8925193,
    longitude: 98.8267127,
  },

  // Northeast Region
  {
    id: "place-phu-kradueng",
    name: "ภูกระดึง",
    location: "อำเภอภูกระดึง",
    province: "เลย",
    region: "northeast",
    description:
      "ที่ราบสูงหินทราย ท่องเที่ยวเดินป่าค้างคืน ผาหล่มสัก และลานกว้างบนยอดภู",
    type: "mountain",
    isNationalPark: true,
    altitude: "1316 m",
    distance: "9.0 km",

    latitude: 16.888506,
    longitude: 101.7667183,
  },
  {
    id: "place-phu-reua",
    name: "ภูเรือ",
    location: "อำเภอภูเรือ",
    province: "เลย",
    region: "northeast",
    description: "ภูเรือ ยอดเขาสูงชัน วิวทิวทัศน์ และฤดูหนาวที่สวยงาม",
    type: "mountain",
    isNationalPark: true,
    altitude: "1365 m",
    distance: "7.5 km",

    latitude: 17.4938327,
    longitude: 101.3413007,
  },
  {
    id: "place-phu-wieng",
    name: "ภูเวียง",
    location: "อำเภอภูเวียง",
    province: "อุดรธานี",
    region: "northeast",
    description: "ภูเวียง ยอดเขาที่สูงที่สุดในภาคอีสาน วิวทิวทัศน์ และศาสนสถาน",
    type: "mountain",
    isNationalPark: true,
    altitude: "1279 m",
    distance: "8.0 km",

    latitude: 16.702482,
    longitude: 102.2520099,
  },
  {
    id: "place-tat-ton",
    name: "น้ำตกตาดโตน",
    location: "อำเภอนากลาง",
    province: "ชัยภูมิ",
    region: "northeast",
    description: "น้ำตกตาดโตน น้ำตกในอุทยานแห่งชาติ สวยงามและเดินทางสะดวก",
    type: "waterfall",
    isNationalPark: true,
    altitude: "300 m",
    distance: "2.0 km",

    latitude: 15.9817656,
    longitude: 102.0280442,
  },

  // East Region
  {
    id: "place-khao-sam-roi-yod",
    name: "อุทยานแห่งชาติเขาสามร้อยยอด",
    location: "อำเภอคลองวาฬ",
    province: "ประจวบคีรีขันธ์",
    region: "east",
    description: "อุทยานแห่งชาติเขาสามร้อยยอด หน้าผาสูง ถ้ำ และหาดทรายขาว",
    type: "national_park",
    altitude: "605 m",
    distance: "8.0 km",

    latitude: 12.2013677,
    longitude: 99.961136,
  },

  // West Region
];
