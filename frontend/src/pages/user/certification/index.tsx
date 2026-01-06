import { View, Text, Input, Button } from '@tarojs/components'
import { useState, useEffect } from 'react'
import Taro from '@tarojs/taro'
import { useAuthStore } from '@/stores/useAuthStore'
import { submitCertification, getCertificationStatus } from '@/services/user'
import type { CertificationData } from '@/types'
import './certification.scss'

export default function Certification() {
  const { userInfo, updateUserInfo } = useAuthStore()
  const [loading, setLoading] = useState(false)
  const [certStatus, setCertStatus] = useState<{
    status: string
    rejectReason?: string
  } | null>(null)
  
  const [formData, setFormData] = useState<CertificationData>({
    realName: '',
    idCard: '',
    building: '',
    unit: '',
    room: '',
    phone: ''
  })

  useEffect(() => {
    loadCertificationStatus()
  }, [])

  const loadCertificationStatus = async () => {
    try {
      const res = await getCertificationStatus()
      if (res.success && res.data) {
        setCertStatus({
          status: res.data.status,
          rejectReason: res.data.rejectReason
        })
        // 如果已提交过，填充住址信息
        if (res.data.building) {
          setFormData(prev => ({
            ...prev,
            building: res.data!.building || '',
            unit: res.data!.unit || '',
            room: res.data!.room || ''
          }))
        }
      }
    } catch (error) {
      console.error('获取认证状态失败:', error)
    }
  }

  const handleInputChange = (field: keyof CertificationData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const validateForm = (): boolean => {
    if (!formData.realName.trim()) {
      Taro.showToast({ title: '请输入真实姓名', icon: 'none' })
      return false
    }
    if (!formData.idCard.trim()) {
      Taro.showToast({ title: '请输入身份证号', icon: 'none' })
      return false
    }
    // 身份证号验证
    const idCardRegex = /(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/
    if (!idCardRegex.test(formData.idCard)) {
      Taro.showToast({ title: '身份证号格式不正确', icon: 'none' })
      return false
    }
    if (!formData.building.trim()) {
      Taro.showToast({ title: '请输入楼栋号', icon: 'none' })
      return false
    }
    if (!formData.unit.trim()) {
      Taro.showToast({ title: '请输入单元号', icon: 'none' })
      return false
    }
    if (!formData.room.trim()) {
      Taro.showToast({ title: '请输入房间号', icon: 'none' })
      return false
    }
    return true
  }

  const handleSubmit = async () => {
    if (!validateForm()) return

    setLoading(true)
    try {
      const res = await submitCertification(formData)
      
      if (res.success) {
        Taro.showToast({
          title: '认证申请已提交',
          icon: 'success'
        })
        // 更新本地用户信息
        updateUserInfo({
          authStatus: 'pending' as any,
          building: formData.building,
          unit: formData.unit,
          room: formData.room
        })
        setCertStatus({ status: 'pending' })
      }
    } catch (error: any) {
      Taro.showToast({
        title: error.message || '提交失败',
        icon: 'none'
      })
    } finally {
      setLoading(false)
    }
  }

  // 已认证状态
  if (certStatus?.status === 'verified' || userInfo?.authStatus === 'verified') {
    return (
      <View className="certification-page">
        <View className="status-card verified">
          <Text className="status-icon">✅</Text>
          <Text className="status-title">认证通过</Text>
          <Text className="status-desc">
            您的住户身份已通过认证
          </Text>
          <View className="address-info">
            <Text>{userInfo?.building}栋 {userInfo?.unit}单元 {userInfo?.room}室</Text>
          </View>
        </View>
      </View>
    )
  }

  // 待审核状态
  if (certStatus?.status === 'pending') {
    return (
      <View className="certification-page">
        <View className="status-card pending">
          <Text className="status-icon">⏳</Text>
          <Text className="status-title">审核中</Text>
          <Text className="status-desc">
            您的认证申请正在审核中，请耐心等待
          </Text>
          <View className="address-info">
            <Text>{formData.building}栋 {formData.unit}单元 {formData.room}室</Text>
          </View>
        </View>
      </View>
    )
  }

  // 被拒绝状态 - 可以重新提交
  const isRejected = certStatus?.status === 'rejected'

  return (
    <View className="certification-page">
      {isRejected && (
        <View className="reject-notice">
          <Text className="reject-title">⚠️ 认证未通过</Text>
          <Text className="reject-reason">
            {certStatus?.rejectReason || '您提交的信息有误，请核实后重新提交'}
          </Text>
        </View>
      )}

      <View className="form-section">
        <View className="section-title">个人信息</View>
        
        <View className="form-item">
          <Text className="form-label">真实姓名</Text>
          <Input
            className="form-input"
            placeholder="请输入真实姓名"
            value={formData.realName}
            onInput={(e) => handleInputChange('realName', e.detail.value)}
          />
        </View>

        <View className="form-item">
          <Text className="form-label">身份证号</Text>
          <Input
            className="form-input"
            placeholder="请输入身份证号"
            value={formData.idCard}
            onInput={(e) => handleInputChange('idCard', e.detail.value)}
          />
        </View>

        <View className="form-item">
          <Text className="form-label">手机号码</Text>
          <Input
            className="form-input"
            type="number"
            placeholder="选填，方便物业联系您"
            value={formData.phone}
            onInput={(e) => handleInputChange('phone', e.detail.value)}
          />
        </View>
      </View>

      <View className="form-section">
        <View className="section-title">住址信息</View>
        
        <View className="form-row">
          <View className="form-item flex-1">
            <Text className="form-label">楼栋</Text>
            <Input
              className="form-input"
              placeholder="如：1"
              value={formData.building}
              onInput={(e) => handleInputChange('building', e.detail.value)}
            />
          </View>

          <View className="form-item flex-1">
            <Text className="form-label">单元</Text>
            <Input
              className="form-input"
              placeholder="如：2"
              value={formData.unit}
              onInput={(e) => handleInputChange('unit', e.detail.value)}
            />
          </View>

          <View className="form-item flex-1">
            <Text className="form-label">房间</Text>
            <Input
              className="form-input"
              placeholder="如：101"
              value={formData.room}
              onInput={(e) => handleInputChange('room', e.detail.value)}
            />
          </View>
        </View>
      </View>

      <View className="notice-section">
        <Text className="notice-title">📌 温馨提示</Text>
        <Text className="notice-text">
          1. 请确保填写信息真实有效，审核通过后不可修改
        </Text>
        <Text className="notice-text">
          2. 您的个人信息将被加密存储，仅用于住户身份验证
        </Text>
        <Text className="notice-text">
          3. 审核时间一般为1-3个工作日
        </Text>
      </View>

      <View className="submit-section">
        <Button
          className="submit-button"
          loading={loading}
          onClick={handleSubmit}
        >
          {loading ? '提交中...' : isRejected ? '重新提交' : '提交认证'}
        </Button>
      </View>
    </View>
  )
}
