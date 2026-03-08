import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { toast } from "sonner";

export function DriverDashboard() {
  const driverInfo = useQuery(api.users.getDriverInfo);
  const availableRides = useQuery(api.rides.getAvailableRides);
  const currentRide = useQuery(api.rides.getCurrentRide);
  const userRides = useQuery(api.rides.getUserRides);
  
  const updateDriverStatus = useMutation(api.users.updateDriverStatus);
  const acceptRide = useMutation(api.rides.acceptRide);
  const updateRideStatus = useMutation(api.rides.updateRideStatus);

  const [isOnline, setIsOnline] = useState(driverInfo?.status === "online");

  const handleToggleStatus = async () => {
    if (!driverInfo || driverInfo.verificationStatus !== "verified") {
      toast.error("يجب أن تكون موثقاً للعمل");
      return;
    }

    const newStatus = isOnline ? "offline" : "online";
    try {
      await updateDriverStatus({
        status: newStatus,
        location: newStatus === "online" ? {
          lat: 30.0444, // Default location for السنطة
          lng: 31.2357,
        } : undefined,
      });
      setIsOnline(!isOnline);
      toast.success(newStatus === "online" ? "أصبحت متاحاً لاستقبال الطلبات" : "تم إيقاف استقبال الطلبات");
    } catch (error: any) {
      toast.error(error.message || "حدث خطأ أثناء تحديث الحالة");
    }
  };

  const handleAcceptRide = async (rideId: string) => {
    try {
      await acceptRide({ rideId: rideId as any });
      toast.success("تم قبول الطلب بنجاح!");
    } catch (error) {
      toast.error("حدث خطأ أثناء قبول الطلب");
    }
  };

  const handleUpdateRideStatus = async (status: "driver_arriving" | "in_progress" | "completed") => {
    if (!currentRide) return;
    
    try {
      await updateRideStatus({
        rideId: currentRide._id,
        status,
        finalPrice: status === "completed" ? currentRide.estimatedPrice : undefined,
      });
      
      const statusMessages = {
        driver_arriving: "تم تأكيد وصولك للراكب",
        in_progress: "تم بدء الرحلة",
        completed: "تم إنهاء الرحلة بنجاح",
      };
      
      toast.success(statusMessages[status]);
    } catch (error) {
      toast.error("حدث خطأ أثناء تحديث حالة الرحلة");
    }
  };

  if (!driverInfo) {
    return (
      <div className="flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
      </div>
    );
  }

  // Show verification status
  if (driverInfo.verificationStatus === "pending_verification") {
    return (
      <div className="max-w-3xl mx-auto">
        <div className="bg-gradient-to-br from-yellow-50 to-orange-100 rounded-2xl shadow-xl p-8 border border-yellow-200">
          <div className="text-center">
            <div className="text-6xl mb-4">⏳</div>
            <h2 className="text-3xl font-bold text-gray-800 mb-4">جاري مراجعة مستنداتك</h2>
            <p className="text-xl text-gray-600 mb-6">
              تم استلام مستنداتك وهي قيد المراجعة من قبل الإدارة
            </p>
            <div className="bg-white rounded-xl p-6 border border-yellow-200">
              <div className="space-y-3 text-gray-700">
                <p className="flex items-center gap-3">
                  <span className="text-blue-600">🚗</span>
                  <span>التوك توك: {driverInfo.carNumber}</span>
                </p>
                <p className="flex items-center gap-3">
                  <span className="text-green-600">🪪</span>
                  <span>رخصة القيادة: {driverInfo.licenseNumber}</span>
                </p>
                <p className="flex items-center gap-3">
                  <span className="text-purple-600">📍</span>
                  <span>المحافظة: {driverInfo.city}</span>
                </p>
              </div>
            </div>
            <div className="mt-6 bg-blue-50 border border-blue-200 rounded-xl p-4">
              <p className="text-blue-800 text-sm">
                <strong>ملاحظة:</strong> ستتمكن من البدء في العمل فور الموافقة على مستنداتك. 
                قد تستغرق عملية المراجعة من دقائق إلى ساعات أو أيام حسب الحمولة.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (driverInfo.verificationStatus === "rejected") {
    return (
      <div className="max-w-3xl mx-auto">
        <div className="bg-gradient-to-br from-red-50 to-pink-100 rounded-2xl shadow-xl p-8 border border-red-200">
          <div className="text-center">
            <div className="text-6xl mb-4">❌</div>
            <h2 className="text-3xl font-bold text-gray-800 mb-4">تم رفض مستنداتك</h2>
            <p className="text-xl text-gray-600 mb-6">
              للأسف، لم تتم الموافقة على مستنداتك
            </p>
            {driverInfo.rejectionReason && (
              <div className="bg-white rounded-xl p-6 border border-red-200 mb-6">
                <h3 className="font-bold text-gray-800 mb-2">سبب الرفض:</h3>
                <p className="text-gray-700">{driverInfo.rejectionReason}</p>
              </div>
            )}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <p className="text-blue-800 text-sm">
                يرجى التواصل مع الإدارة لمعرفة كيفية تصحيح المستندات وإعادة التقديم.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Driver Status */}
      <div className="bg-gradient-to-br from-white to-blue-50 rounded-2xl shadow-xl p-8 border border-blue-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="text-6xl">🛺</div>
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">حالة السائق</h2>
              <div className="space-y-1 text-gray-600">
                <p className="flex items-center gap-2">
                  <span className="text-green-600">✅</span>
                  <span className="font-medium">سائق تحت المراجعة</span>
                </p>
                <p className="flex items-center gap-2">
                  <span className="text-blue-600">🚗</span>
                  <span>التوك توك: {driverInfo.carNumber}</span>
                </p>
                <p className="flex items-center gap-2">
                  <span className="text-green-600">📊</span>
                  <span>إجمالي الرحلات: {driverInfo.totalRides}</span>
                </p>
                <p className="flex items-center gap-2">
                  <span className="text-yellow-600">⭐</span>
                  <span>التقييم: {driverInfo.rating.toFixed(1)}</span>
                </p>
                <p className="flex items-center gap-2">
                  <span className="text-purple-600">📍</span>
                  <span>المحافظة: {driverInfo.city}</span>
                </p>
              </div>
            </div>
          </div>
          <div className="text-center">
            <button
              onClick={handleToggleStatus}
              className={`px-8 py-4 rounded-2xl font-bold text-lg transition-all transform hover:scale-105 shadow-lg ${
                isOnline
                  ? "bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700"
                  : "bg-gradient-to-r from-gray-500 to-gray-600 text-white hover:from-gray-600 hover:to-gray-700"
              }`}
            >
              {isOnline ? "🟢 متاح للعمل" : "🔴 غير متاح"}
            </button>
            <p className="text-sm text-gray-600 mt-3">
              {isOnline ? "يمكنك استقبال طلبات جديدة" : "لن تستقبل طلبات جديدة"}
            </p>
          </div>
        </div>
      </div>

      {/* Current Ride */}
      {currentRide && (
        <div className="bg-gradient-to-br from-white to-green-50 rounded-2xl shadow-xl p-8 border border-green-200">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
            <span className="text-3xl">🚖</span>
            الرحلة الحالية
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <span className="text-blue-600 text-xl">👤</span>
                <div>
                  <span className="font-medium text-gray-700">الراكب: </span>
                  <span className="font-bold">{(currentRide as any).passengerName}</span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-green-600 text-xl">📞</span>
                <div>
                  <span className="font-medium text-gray-700">الهاتف: </span>
                  <span className="text-blue-600 font-bold">{currentRide.passengerPhone}</span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-red-600 text-xl">📍</span>
                <div>
                  <span className="font-medium text-gray-700">من: </span>
                  <span>{currentRide.pickupLocation.address}</span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-purple-600 text-xl">🎯</span>
                <div>
                  <span className="font-medium text-gray-700">إلى: </span>
                  <span>{currentRide.dropoffLocation.address}</span>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <div className="bg-green-100 rounded-xl p-4 border border-green-200">
                <div className="flex items-center gap-3">
                  <span className="text-green-600 text-2xl">💰</span>
                  <div>
                    <span className="font-medium text-gray-700">السعر: </span>
                    <span className="text-green-600 font-bold text-xl">{currentRide.estimatedPrice} جنيه</span>
                  </div>
                </div>
              </div>
              {currentRide.notes && (
                <div className="bg-blue-100 rounded-xl p-4 border border-blue-200">
                  <div className="flex items-start gap-3">
                    <span className="text-blue-600 text-xl">📝</span>
                    <div>
                      <span className="font-medium text-gray-700">ملاحظات: </span>
                      <span>{currentRide.notes}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="mt-8 space-y-4">
            {currentRide.status === "accepted" && (
              <button
                onClick={() => handleUpdateRideStatus("driver_arriving")}
                className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white py-4 px-6 rounded-xl hover:from-blue-600 hover:to-blue-700 font-bold text-lg transition-all transform hover:scale-105 shadow-lg"
              >
                🚗 وصلت للراكب
              </button>
            )}
            {currentRide.status === "driver_arriving" && (
              <button
                onClick={() => handleUpdateRideStatus("in_progress")}
                className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white py-4 px-6 rounded-xl hover:from-green-600 hover:to-green-700 font-bold text-lg transition-all transform hover:scale-105 shadow-lg"
              >
                🚀 بدء الرحلة
              </button>
            )}
            {currentRide.status === "in_progress" && (
              <button
                onClick={() => handleUpdateRideStatus("completed")}
                className="w-full bg-gradient-to-r from-purple-500 to-purple-600 text-white py-4 px-6 rounded-xl hover:from-purple-600 hover:to-purple-700 font-bold text-lg transition-all transform hover:scale-105 shadow-lg"
              >
                ✅ إنهاء الرحلة
              </button>
            )}
          </div>
        </div>
      )}

      {/* Available Rides */}
      {!currentRide && isOnline && driverInfo.verificationStatus === "verified" && (
        <div className="bg-gradient-to-br from-white to-yellow-50 rounded-2xl shadow-xl p-8 border border-yellow-200">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
            <span className="text-3xl">🔍</span>
            الطلبات المتاحة
          </h2>
          {availableRides && availableRides.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {availableRides.map((ride) => (
                <div key={ride._id} className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all transform hover:scale-105">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-blue-600 text-lg">👤</span>
                        <p className="font-bold text-lg">{ride.passengerName}</p>
                      </div>
                      <div className="space-y-2 text-sm">
                        <p className="flex items-center gap-2">
                          <span className="text-red-600">📍</span>
                          <span className="text-gray-600">من: {ride.pickupLocation.address}</span>
                        </p>
                        <p className="flex items-center gap-2">
                          <span className="text-purple-600">🎯</span>
                          <span className="text-gray-600">إلى: {ride.dropoffLocation.address}</span>
                        </p>
                        <p className="flex items-center gap-2">
                          <span className="text-blue-600">📏</span>
                          <span className="text-gray-600">المسافة: {ride.distance} كم</span>
                        </p>
                        {ride.notes && (
                          <p className="flex items-start gap-2">
                            <span className="text-yellow-600">📝</span>
                            <span className="text-gray-600">ملاحظات: {ride.notes}</span>
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="text-center ml-4">
                      <div className="bg-green-100 rounded-xl p-3 mb-3 border border-green-200">
                        <p className="text-2xl font-bold text-green-600">{ride.estimatedPrice}</p>
                        <p className="text-sm text-green-600">جنيه</p>
                      </div>
                      <button
                        onClick={() => handleAcceptRide(ride._id)}
                        className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-3 rounded-xl hover:from-blue-600 hover:to-blue-700 font-bold transition-all transform hover:scale-105 shadow-lg"
                      >
                        قبول الطلب
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🔍</div>
              <p className="text-xl text-gray-600 mb-2">لا توجد طلبات متاحة حالياً</p>
              <p className="text-gray-500">سيتم إشعارك عند وجود طلبات جديدة</p>
            </div>
          )}
        </div>
      )}

      {/* Recent Rides */}
      {userRides && userRides.length > 0 && (
        <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-xl p-8 border border-gray-200">
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
