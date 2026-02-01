'use client'

import { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

type Booking = {
  id: string
  check_in: string
  check_out: string
  status: string
  properties: { id: string; name: string } | { id: string; name: string }[] | null
  guests: { id: string; name: string } | { id: string; name: string }[] | null
}

type Property = {
  id: string
  name: string
}

const COLORS = [
  'bg-blue-100 text-blue-800 border-blue-200',
  'bg-green-100 text-green-800 border-green-200',
  'bg-purple-100 text-purple-800 border-purple-200',
  'bg-orange-100 text-orange-800 border-orange-200',
  'bg-pink-100 text-pink-800 border-pink-200',
  'bg-teal-100 text-teal-800 border-teal-200',
  'bg-indigo-100 text-indigo-800 border-indigo-200',
  'bg-yellow-100 text-yellow-800 border-yellow-200',
]

// Helper to get first item from array or object
const getFirst = <T,>(val: T | T[] | null): T | null => {
  if (!val) return null
  if (Array.isArray(val)) return val[0] || null
  return val
}

export default function CalendarView({ bookings, properties }: { bookings: Booking[], properties: Property[] }) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedProperty, setSelectedProperty] = useState<string>('all')

  // Create color map for properties
  const propertyColors: Record<string, string> = {}
  properties.forEach((p, i) => {
    propertyColors[p.id] = COLORS[i % COLORS.length]
  })

  // Filter bookings by selected property
  const filteredBookings = selectedProperty === 'all' 
    ? bookings 
    : bookings.filter(b => getFirst(b.properties)?.id === selectedProperty)

  // Calendar helpers
  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()
  
  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)
  const startPadding = firstDay.getDay()
  const daysInMonth = lastDay.getDate()

  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December']

  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1))
  }

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1))
  }

  const goToToday = () => {
    setCurrentDate(new Date())
  }

  // Get bookings for a specific day
  const getBookingsForDay = (day: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    return filteredBookings.filter(booking => {
      return dateStr >= booking.check_in && dateStr < booking.check_out
    })
  }

  // Check if a day is check-in or check-out
  const isCheckIn = (day: number, booking: Booking) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    return booking.check_in === dateStr
  }

  const isCheckOut = (day: number, booking: Booking) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    return booking.check_out === dateStr
  }

  const isToday = (day: number) => {
    const today = new Date()
    return day === today.getDate() && month === today.getMonth() && year === today.getFullYear()
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <button 
              onClick={prevMonth}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <h2 className="text-lg font-semibold text-gray-900 min-w-[160px] text-center">
              {monthNames[month]} {year}
            </h2>
            <button 
              onClick={nextMonth}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
          <button
            onClick={goToToday}
            className="px-3 py-1 text-sm border rounded-lg hover:bg-gray-50 transition-colors"
          >
            Today
          </button>
        </div>

        {/* Property Filter */}
        <select
          value={selectedProperty}
          onChange={(e) => setSelectedProperty(e.target.value)}
          className="border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#b5c4b1] focus:border-transparent"
        >
          <option value="all">All Properties</option>
          {properties.map(p => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>
      </div>

      {/* Calendar Grid */}
      <div className="p-4">
        {/* Day Headers */}
        <div className="grid grid-cols-7 mb-2">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="text-center text-sm font-medium text-gray-500 py-2">
              {day}
            </div>
          ))}
        </div>

        {/* Days Grid */}
        <div className="grid grid-cols-7 gap-1">
          {/* Padding for start of month */}
          {Array.from({ length: startPadding }).map((_, i) => (
            <div key={`pad-${i}`} className="min-h-[100px] bg-gray-50 rounded-lg" />
          ))}

          {/* Days */}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1
            const dayBookings = getBookingsForDay(day)
            
            return (
              <div 
                key={day}
                className={`min-h-[100px] border rounded-lg p-1 ${
                  isToday(day) ? 'border-[#3d3530] border-2' : 'border-gray-200'
                }`}
              >
                <div className={`text-sm font-medium mb-1 ${
                  isToday(day) ? 'text-[#3d3530]' : 'text-gray-700'
                }`}>
                  {day}
                </div>
                <div className="space-y-1">
                  {dayBookings.slice(0, 3).map(booking => {
                    const prop = getFirst(booking.properties)
                    const guest = getFirst(booking.guests)
                    const colorClass = prop?.id 
                      ? propertyColors[prop.id] 
                      : 'bg-gray-100 text-gray-800'
                    const checkIn = isCheckIn(day, booking)
                    const checkOut = isCheckOut(day, booking)
                    
                    return (
                      <div
                        key={booking.id}
                        className={`text-xs px-1.5 py-0.5 rounded truncate border ${colorClass}`}
                        title={`${prop?.name || 'Property'}: ${guest?.name || 'Guest'} (${booking.check_in} to ${booking.check_out})`}
                      >
                        {checkIn && '→ '}
                        {prop?.name?.split(' ')[0] || 'Booking'}
                        {checkOut && ' →'}
                      </div>
                    )
                  })}
                  {dayBookings.length > 3 && (
                    <div className="text-xs text-gray-500 px-1">
                      +{dayBookings.length - 3} more
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Legend */}
      {properties.length > 0 && (
        <div className="p-4 border-t bg-gray-50">
          <p className="text-sm text-gray-500 mb-2">Properties:</p>
          <div className="flex flex-wrap gap-2">
            {properties.map(p => (
              <span 
                key={p.id}
                className={`text-xs px-2 py-1 rounded border ${propertyColors[p.id]}`}
              >
                {p.name}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
