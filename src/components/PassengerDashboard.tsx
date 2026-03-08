import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { toast } from "sonner";

export function PassengerDashboard() {
  const [showBooking, setShowBooking] = useState(false);
  const [pickupAddress, setPickupAddress] = useState("");
  const [dropoffAddress, setDropoffAddress] = useState("");
  const [distance, setDistance] = useState(5); // Default 5km
  const [notes, setNotes] = useState("");

  const currentRide = useQuery(api.rides.getCurrentRide);
  const userRides = useQuery(api.rides.getUserRides);
  const createRide = useMutation(api.rides.createRide);
  const updateRideStatus = useMutation(api.rides.updateRideStatus);

  const handleCreateRide = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pickupAddress.trim() || !dropoffAddress.trim()) {
      toast.error("يرجى ملء عناوين الانطلاق والوصول");
      return;
    }

    try {
      await createRide({
        pickupLocation: {
          lat: 30.0444, // Default coordinates for السنطة
          lng: 31.2357,
          address: pickupAddress.trim(),
        },
        dropoffLocation: {
          lat: 30.0444 + (Math.random() - 0.5) * 0.01,
          lng: 31.2357 + (Math.random() - 0.5) * 0.01,
          address: dropoffAddress.trim(),
        },
        distance,
        notes: notes.trim() || undefined,
      });
      
      toast.success("تم طلب الرحلة بنجاح! جاري البحث عن سائق...");
      setShowBooking(false);
      setPickupAddress("");
      setDropoffAddress("");
      setNotes("");
    } catch (error) {
      toast.error("حدث خطأ أثناء طلب الرحلة");
      console.error(error);
    }
  };

  const handleCancelRide = async () => {
    if (!currentRide) return;
    
    try {
      await updateRideStatus({
        rideId: currentRide._id,
        status: "cancelled",
      });
      toast.success("تم إلغاء الرحلة");
    } catch (error) {
      toast.error("حدث خطأ أثناء إلغاء الرحلة");
    }
  };

  const estimatedPrice = 5 + (distance * 3); // Base price + distance price

  if (currentRide) {
    return (
      <div className="max-w-3xl mx-auto">
        <div className="bg-gradient-to-br from-white to-blue-50 rounded-2xl shadow-xl p-8 border border-blue-200">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
              <span className="text-3xl">🛺</span>
              الرحلة الحالية
            </h2>
            <span className={`px-4 py-2 rounded-full text-sm font-bold ${
              currentRide.status === "searching" ? "bg-yellow-100 text-yellow-800" :
              currentRide.status === "accepted" ? "bg-blue-100 text-blue-800" :
              currentRide.status === "driver_arriving" ? "bg-purple-100 text-purple-800" :
              currentRide.status === "in_progress" ? "bg-green-100 text-green-800" :
              "bg-gray-100 text-gray-800"
            }`}>
              {currentRide.status === "searching" && "🔍 جاري البحث عن سائق"}
              {currentRide.status === "accepted" && "✅ تم قبول الطلب"}
              {currentRide.status === "driver_arriving" && "🚗 السائق في الطريق"}
              {currentRide.status === "in_progress" && "🚀 الرحلة جارية"}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <span className="text-red-600 text-xl">📍</span>
                <div>
                  <span className="font-medium text-gray-700">من: </span>
                  <span className="font-bold">{currentRide.pickupLocation.address}</span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-purple-600 text-xl">🎯</span>
                <div>
                  <span className="font-medium text-gray-700">إلى: </span>
                  <span className="font-bold">{currentRide.dropoffLocation.address}</span>
                </div>
              </div>
              <div className="bg-green-100 rounded-xl p-4 border border-green-200">
                <div className="flex items-center gap-3">
                  <span className="text-green-600 text-2xl">💰</span>
                  <div>
                    <span className="font-medium text-gray-700">السعر المتوقع: </span>
                    <span className="text-green-600 font-bold text-xl">{currentRide.estimatedPrice} جنيه</span>
                  </div>
                </div>
              </div>
            </div>
            
            {(currentRide as any).driverName && (
              <div className="bg-white rounded-xl p-6 border border-gray-200">
                <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <span className="text-xl">👨‍💼</span>
                  بيانات السائق
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <span className="text-blue-600">👤</span>
                    <div>
                      <span className="font-medium text-gray-700">الاسم: </span>
                      <span className="font-bold">{(currentRide as any).driverName}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-green-600">🛺</span>
                    <div>
                      <span className="font-medium text-gray-700">رقم التوك توك: </span>
                      <span className="font-bold">{(currentRide as any).carNumber}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-purple-600">📞</span>
                    <div>
                      <span className="font-medium text-gray-700">الهاتف: </span>
                      <span className="text-blue-600 font-bold">{currentRide.driverPhone}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {currentRide.status === "searching" && (
            <div className="mt-8">
              <button
                onClick={handleCancelRide}
                className="w-full bg-gradient-to-r from-red-500 to-red-600 text-white py-4 px-6 rounded-xl hover:from-red-600 hover:to-red-700 font-bold text-lg transition-all transform hover:scale-105 shadow-lg"
              >
                إلغاء الطلب
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {!showBooking ? (
        <div className="text-center">
          <div className="bg-gradient-to-br from-white to-blue-50 rounded-2xl shadow-xl p-12 border border-blue-200">
            <div className="text-8xl mb-6 animate-bounce">🛺</div>
            <h2 className="text-4xl font-bold text-gray-800 mb-4">طلب رحلة جديدة</h2>
            <p className="text-xl text-gray-600 mb-8">احجز توك توك بسهولة وسرعة</p>
            <div className="flex justify-center gap-8 mb-8 text-gray-600">
              <div className="flex items-center gap-2">
                <span className="text-green-500 text-xl">✓</span>
                <span>أسعار مناسبة</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-green-500 text-xl">✓</span>
                <span>خدمة سريعة</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-green-500 text-xl">✓</span>
                <span>سائقين موثوقين</span>
              </div>
            </div>
            <button
              onClick={() => setShowBooking(true)}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-12 py-4 rounded-2xl text-xl font-bold hover:from-blue-700 hover:to-indigo-700 transition-all transform hover:scale-105 shadow-lg"
            >
              احجز الآن
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-gradient-to-br from-white to-indigo-50 rounded-2xl shadow-xl p-8 border border-indigo-200">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
              <span className="text-3xl">📋</span>
              تفاصيل الرحلة
            </h2>
            <button
              onClick={() => setShowBooking(false)}
              className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
            >
              ✕
            </button>
          </div>

          <form onSubmit={handleCreateRide} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  نقطة الانطلاق *
                </label>
                <input
                  type="text"
                  value={pickupAddress}
                  onChange={(e) => setPickupAddress(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="أدخل عنوان الانطلاق"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  نقطة الوصول *
                </label>
                <input
                  type="text"
                  value={dropoffAddress}
                  onChange={(e) => setDropoffAddress(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="أدخل عنوان الوصول"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                المسافة التقديرية (كم)
              </label>
              <input
                type="number"
                min="1"
                max="50"
                value={distance}
                onChange={(e) => setDistance(Number(e.target.value))}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                ملاحظات (اختياري)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                rows={3}
                placeholder="أي ملاحظات إضافية..."
              />
            </div>

            <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-xl border border-green-200">
              <div className="flex justify-between items-center">
                <span className="font-bold text-lg text-gray-800">السعر المتوقع:</span>
                <span className="text-3xl font-bold text-green-600">{estimatedPrice} جنيه</span>
              </div>
              <p className="text-sm text-gray-600 mt-2">
                (5 جنيه فتح عداد + {distance} كم × 3 جنيه)
              </p>
            </div>

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-4 px-6 rounded-xl hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-blue-500 font-bold text-lg transition-all transform hover:scale-105 shadow-lg"
            >
              طلب الرحلة
            </button>
          </form>
        </div>
      )}

      {/* Recent Rides */}
      {userRides && userRides.length > 0 && (
        <div className="mt-8 bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-xl p-8 border border-gray-200">
          <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
            <span className="text-3xl">📊</span>
            الرحلات السابقة
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {userRides.slice(0, 6).map((ride) => (
              <div key={ride._id} className="bg-white rounded-xl p-4 border border-gray-200 hover:shadow-md transition-all">
                <div className="space-y-2">
                  <p className="font-medium text-gray-800 truncate">{ride.pickupLocation.address}</p>
                  <p className="text-sm text-gray-600 truncate">إلى: {ride.dropoffLocation.address}</p>
                  <div className="flex justify-between items-center">
                    <p className="font-bold text-green-600">
                      {ride.finalPrice || ride.estimatedPrice} جنيه
                    </p>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      ride.status === "completed" ? "bg-green-100 text-green-800" :
                      ride.status === "cancelled" ? "bg-red-100 text-red-800" :
                      "bg-gray-100 text-gray-800"
                    }`}>
                      {ride.status === "completed" && "مكتملة"}
                      {ride.status === "cancelled" && "ملغاة"}
                      {ride.status === "searching" && "جاري البحث"}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500">
                    {new Date(ride._creationTime).toLocaleDateString('ar-EG')}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
