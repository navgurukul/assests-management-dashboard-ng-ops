'use client';

import { Mail, Phone, MapPin, Calendar, Building } from 'lucide-react';
import CustomButton from '@/components/atoms/CustomButton';

export default function UserProfileTab({ userData, onEditProfile }) {
  return (
    <div>
      {/* Information Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Email */}
        <div className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
          <div className="bg-blue-100 p-2 rounded-lg">
            <Mail className="w-4 h-4 text-blue-600" />
          </div>
          <div>
            <p className="text-xs text-gray-500">Email</p>
            <p className="text-sm text-gray-900 font-medium">{userData.email}</p>
          </div>
        </div>

        {/* Phone */}
        <div className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
          <div className="bg-green-100 p-2 rounded-lg">
            <Phone className="w-4 h-4 text-green-600" />
          </div>
          <div>
            <p className="text-xs text-gray-500">Phone</p>
            <p className="text-sm text-gray-900 font-medium">{userData.phone}</p>
          </div>
        </div>

        {/* Department */}
        <div className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
          <div className="bg-purple-100 p-2 rounded-lg">
            <Building className="w-4 h-4 text-purple-600" />
          </div>
          <div>
            <p className="text-xs text-gray-500">Department</p>
            <p className="text-sm text-gray-900 font-medium">{userData.department}</p>
          </div>
        </div>

        {/* Location */}
        <div className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
          <div className="bg-orange-100 p-2 rounded-lg">
            <MapPin className="w-4 h-4 text-orange-600" />
          </div>
          <div>
            <p className="text-xs text-gray-500">Location</p>
            <p className="text-sm text-gray-900 font-medium">{userData.location}</p>
          </div>
        </div>

        {/* Join Date */}
        <div className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
          <div className="bg-indigo-100 p-2 rounded-lg">
            <Calendar className="w-4 h-4 text-indigo-600" />
          </div>
          <div>
            <p className="text-xs text-gray-500">Member Since</p>
            <p className="text-sm text-gray-900 font-medium">{userData.joinDate}</p>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="mt-6 flex gap-3">
        <CustomButton 
          text="Edit Profile" 
          variant="primary" 
          size="md"
          onClick={onEditProfile}
        />
      </div>
    </div>
  );
}
