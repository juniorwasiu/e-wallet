'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { User } from '@/lib/store';
import { db } from '@/lib/db';
import { User as UserIcon, Phone, MapPin, Calendar, CreditCard, Save, Edit2 } from 'lucide-react';

interface Props { user: User; onUpdate: () => void; }

export default function UserProfile({ user, onUpdate }: Props) {
    const [editing, setEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    const { register, handleSubmit, formState: { errors } } = useForm({
        defaultValues: {
            phone: user.phone,
            address: user.address,
            city: user.city,
            state: user.state,
            zip: user.zip,
        },
    });

    const onSubmit = async (data: { phone: string; address: string; city: string; state: string; zip: string }) => {
        console.log('[UserProfile] 💾 Saving profile update for:', user.id);
        setIsSaving(true);
        const result = await db.profiles.update(user.id, data);
        setIsSaving(false);
        if (result.success) {
            setEditing(false);
            onUpdate();
            toast.success('Profile updated successfully');
        } else {
            toast.error(result.error ?? 'Failed to update profile. Please try again.');
            console.error('[UserProfile] ❌ Profile update failed:', result.error);
        }
    };

    return (
        <div className="space-y-6 max-w-2xl">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold">My Profile</h2>
                    <p className="text-sm text-[hsl(var(--muted-foreground))] mt-0.5">Manage your personal information</p>
                </div>
                {!editing && (
                    <button onClick={() => setEditing(true)} className="btn-secondary flex items-center gap-2">
                        <Edit2 size={15} /> Edit Profile
                    </button>
                )}
            </div>

            {/* Avatar + name */}
            <div className="card p-6 flex items-center gap-5">
                <div className="w-20 h-20 rounded-2xl flex items-center justify-center text-white text-2xl font-bold shrink-0" style={{ backgroundColor: user.avatarColor }}>
                    {user.firstName[0]}{user.lastName[0]}
                </div>
                <div>
                    <h3 className="text-xl font-bold">{user.firstName} {user.lastName}</h3>
                    <p className="text-[hsl(var(--muted-foreground))] text-sm">{user.email}</p>
                    <div className="flex items-center gap-3 mt-2">
                        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${user.kycStatus === 'approved' ? 'badge-success' : 'badge-warning'}`}>
                            {user.kycStatus === 'approved' ? '✓ KYC Verified' : 'KYC Pending'}
                        </span>
                        <span className="text-xs text-[hsl(var(--muted-foreground))]">Member since {new Date(user.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</span>
                    </div>
                </div>
            </div>

            {/* Details */}
            <div className="card p-6">
                <h4 className="text-sm font-semibold text-[hsl(var(--muted-foreground))] uppercase tracking-wide mb-5">Personal Information</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <UserIcon size={14} className="text-[hsl(var(--muted-foreground))]" />
                            <label className="text-xs font-medium text-[hsl(var(--muted-foreground))] uppercase tracking-wide">Full Name</label>
                        </div>
                        <p className="text-sm font-semibold">{user.firstName} {user.lastName}</p>
                    </div>
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <Calendar size={14} className="text-[hsl(var(--muted-foreground))]" />
                            <label className="text-xs font-medium text-[hsl(var(--muted-foreground))] uppercase tracking-wide">Date of Birth</label>
                        </div>
                        <p className="text-sm font-semibold">{new Date(user.dob).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
                    </div>
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <CreditCard size={14} className="text-[hsl(var(--muted-foreground))]" />
                            <label className="text-xs font-medium text-[hsl(var(--muted-foreground))] uppercase tracking-wide">SSN</label>
                        </div>
                        <p className="text-sm font-semibold font-mono">••• - •• - {user.ssn_last4}</p>
                    </div>
                </div>
            </div>

            {/* Editable fields */}
            <form onSubmit={handleSubmit(onSubmit)} className="card p-6 space-y-5">
                <h4 className="text-sm font-semibold text-[hsl(var(--muted-foreground))] uppercase tracking-wide">Contact & Address</h4>

                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <Phone size={14} className="text-[hsl(var(--muted-foreground))]" />
                        <label className="label">Phone Number</label>
                    </div>
                    {editing ? (
                        <>
                            <input className={`input-field ${errors.phone ? 'border-red-400' : ''}`} {...register('phone', { required: 'Phone is required' })} />
                            {errors.phone && <p className="field-error">{errors.phone.message}</p>}
                        </>
                    ) : (
                        <p className="text-sm font-semibold">{user.phone}</p>
                    )}
                </div>

                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <MapPin size={14} className="text-[hsl(var(--muted-foreground))]" />
                        <label className="label">Street Address</label>
                    </div>
                    {editing ? (
                        <>
                            <input className={`input-field ${errors.address ? 'border-red-400' : ''}`} {...register('address', { required: 'Address is required' })} />
                            {errors.address && <p className="field-error">{errors.address.message}</p>}
                        </>
                    ) : (
                        <p className="text-sm font-semibold">{user.address}</p>
                    )}
                </div>

                <div className="grid grid-cols-3 gap-3">
                    <div className="col-span-1">
                        <label className="label">City</label>
                        {editing ? (
                            <input className="input-field" {...register('city')} />
                        ) : (
                            <p className="text-sm font-semibold">{user.city}</p>
                        )}
                    </div>
                    <div>
                        <label className="label">State</label>
                        {editing ? (
                            <input className="input-field" maxLength={2} {...register('state')} />
                        ) : (
                            <p className="text-sm font-semibold">{user.state}</p>
                        )}
                    </div>
                    <div>
                        <label className="label">ZIP</label>
                        {editing ? (
                            <input className="input-field" maxLength={5} {...register('zip')} />
                        ) : (
                            <p className="text-sm font-semibold">{user.zip}</p>
                        )}
                    </div>
                </div>

                {editing && (
                    <div className="flex gap-3 pt-2">
                        <button type="button" onClick={() => setEditing(false)} className="btn-secondary flex-1">Cancel</button>
                        <button type="submit" disabled={isSaving} className="btn-primary flex-1 flex items-center justify-center gap-2">
                            {isSaving ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save size={15} />}
                            Save Changes
                        </button>
                    </div>
                )}
            </form>
        </div>
    );
}