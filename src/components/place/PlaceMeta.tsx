// TODO: ตอนนี้เป็น static text ทุกสถานที่ ทีหลังจะผูกกับ Place data model จริง (openingHours, campingSpot)
export function PlaceMeta() {
  return (
    <div className="grid grid-cols-2 gap-6">
      <div>
        <p className="mb-1 text-sm font-medium text-forest">ช่วงเวลาเปิดปิด</p>
        <p className="text-sm text-slate">
          เปิดให้บริการทุกวัน ควรหลีกเลี่ยงช่วงฤดูฝน (มิ.ย. – ต.ค.)
        </p>
      </div>

      <div>
        <p className="mb-1 text-sm font-medium text-forest">จุดกางเต็นท์</p>
        <p className="text-sm text-slate">
          มีลานกางเต็นท์ให้บริการภายในพื้นที่อุทยาน
        </p>
      </div>
    </div>
  );
}
