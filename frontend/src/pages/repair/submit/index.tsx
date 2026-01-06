import { View, Text, Input, Picker, Image, Textarea } from '@tarojs/components'
import { useState } from 'react'
import Taro from '@tarojs/taro'
import { submitRepair, RepairCategory } from '@/services/repair'
import { useAuthStore } from '@/stores/useAuthStore'
import './submit.scss'

const CATEGORIES: { value: RepairCategory; label: string; icon: string }[] = [
  { value: 'water', label: '水管问题', icon: '🚰' },
  { value: 'electric', label: '电路问题', icon: '⚡' },
  { value: 'door', label: '门窗问题', icon: '🚪' },
  { value: 'elevator', label: '电梯问题', icon: '🛗' },
  { value: 'public_facility', label: '公共设施', icon: '🏗️' },
  { value: 'other', label: '其他问题', icon: '📦' }
]

const PRIORITIES = ['普通', '重要', '紧急']

export default function RepairSubmit() {
  const { userInfo } = useAuthStore()
  const [form, setForm] = useState({
    category: '' as RepairCategory | '',
    title: '',
    description: '',
    location: '',
    building: userInfo?.building || '',
    unit: userInfo?.unit || '',
    room: userInfo?.room || '',
    contactPerson: userInfo?.nickname || '',
    contactPhone: '',
    priority: 0,
    images: [] as string[]
  })
  const [submitting, setSubmitting] = useState(false)

  const handleCategorySelect = (category: RepairCategory) => {
    setForm({ ...form, category })
  }

  const handleInputChange = (field: string, value: string | number) => {
    setForm({ ...form, [field]: value })
  }

  const handlePriorityChange = (e: any) => {
    setForm({ ...form, priority: parseInt(e.detail.value, 10) })
  }

  const handleChooseImage = async () => {
    if (form.images.length >= 9) {
      Taro.showToast({ title: '最多上传9张图片', icon: 'none' })
      return
    }

    try {
      const res = await Taro.chooseImage({
        count: 9 - form.images.length,
        sizeType: ['compressed'],
        sourceType: ['album', 'camera']
      })

      // 这里应该上传到服务器，暂时使用本地路径
      const newImages = [...form.images, ...res.tempFilePaths]
      setForm({ ...form, images: newImages.slice(0, 9) })
    } catch (error) {
      console.error('选择图片失败:', error)
    }
  }

  const handleRemoveImage = (index: number) => {
    const newImages = form.images.filter((_, i) => i !== index)
    setForm({ ...form, images: newImages })
  }

  const handlePreviewImage = (current: string) => {
    Taro.previewImage({
      urls: form.images,
      current
    })
  }

  const validateForm = () => {
    if (!form.category) {
      Taro.showToast({ title: '请选择问题类型', icon: 'none' })
      return false
    }
    if (!form.title.trim()) {
      Taro.showToast({ title: '请输入报修标题', icon: 'none' })
      return false
    }
    if (!form.description.trim()) {
      Taro.showToast({ title: '请描述问题详情', icon: 'none' })
      return false
    }
    if (!form.contactPhone.trim()) {
      Taro.showToast({ title: '请输入联系电话', icon: 'none' })
      return false
    }
    return true
  }

  const handleSubmit = async () => {
    if (!validateForm() || submitting) return

    setSubmitting(true)
    try {
      const res = await submitRepair({
        category: form.category as RepairCategory,
        title: form.title,
        description: form.description,
        location: form.location,
        building: form.building,
        unit: form.unit,
        room: form.room,
        contactPerson: form.contactPerson,
        contactPhone: form.contactPhone,
        priority: form.priority,
        images: form.images.length > 0 ? form.images : undefined
      })

      if (res.success) {
        Taro.showModal({
          title: '提交成功',
          content: `工单号：${res.data?.orderNo}\n我们将尽快处理您的报修请求`,
          showCancel: false,
          success: () => {
            Taro.navigateBack()
          }
        })
      } else {
        Taro.showToast({ title: res.message || '提交失败', icon: 'none' })
      }
    } catch (error) {
      console.error('提交报修失败:', error)
      Taro.showToast({ title: '提交失败，请重试', icon: 'none' })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <View className="repair-submit-page">
      {/* 问题类型 */}
      <View className="form-section">
        <Text className="section-title">问题类型 *</Text>
        <View className="category-grid">
          {CATEGORIES.map((cat) => (
            <View
              key={cat.value}
              className={`category-item ${form.category === cat.value ? 'active' : ''}`}
              onClick={() => handleCategorySelect(cat.value)}
            >
              <Text className="category-icon">{cat.icon}</Text>
              <Text className="category-label">{cat.label}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* 基本信息 */}
      <View className="form-section">
        <Text className="section-title">报修信息</Text>

        <View className="form-item">
          <Text className="form-label">标题 *</Text>
          <Input
            className="form-input"
            placeholder="简要描述问题"
            maxlength={50}
            value={form.title}
            onInput={(e) => handleInputChange('title', e.detail.value)}
          />
        </View>

        <View className="form-item">
          <Text className="form-label">问题描述 *</Text>
          <Textarea
            className="form-textarea"
            placeholder="请详细描述问题情况，如发生时间、具体现象等"
            maxlength={500}
            value={form.description}
            onInput={(e) => handleInputChange('description', e.detail.value)}
          />
        </View>

        <View className="form-item">
          <Text className="form-label">具体位置</Text>
          <Input
            className="form-input"
            placeholder="如：厨房、卫生间、楼道等"
            maxlength={100}
            value={form.location}
            onInput={(e) => handleInputChange('location', e.detail.value)}
          />
        </View>

        <View className="form-item row">
          <View className="form-field">
            <Text className="form-label">楼栋</Text>
            <Input
              className="form-input"
              placeholder="楼栋号"
              value={form.building}
              onInput={(e) => handleInputChange('building', e.detail.value)}
            />
          </View>
          <View className="form-field">
            <Text className="form-label">单元</Text>
            <Input
              className="form-input"
              placeholder="单元号"
              value={form.unit}
              onInput={(e) => handleInputChange('unit', e.detail.value)}
            />
          </View>
          <View className="form-field">
            <Text className="form-label">房间</Text>
            <Input
              className="form-input"
              placeholder="房间号"
              value={form.room}
              onInput={(e) => handleInputChange('room', e.detail.value)}
            />
          </View>
        </View>
      </View>

      {/* 图片上传 */}
      <View className="form-section">
        <Text className="section-title">现场照片（选填，最多9张）</Text>
        <View className="image-grid">
          {form.images.map((img, index) => (
            <View key={index} className="image-item">
              <Image
                className="uploaded-image"
                src={img}
                mode="aspectFill"
                onClick={() => handlePreviewImage(img)}
              />
              <View className="remove-btn" onClick={() => handleRemoveImage(index)}>
                <Text>×</Text>
              </View>
            </View>
          ))}
          {form.images.length < 9 && (
            <View className="add-image" onClick={handleChooseImage}>
              <Text className="add-icon">📷</Text>
              <Text className="add-text">添加照片</Text>
            </View>
          )}
        </View>
      </View>

      {/* 联系信息 */}
      <View className="form-section">
        <Text className="section-title">联系方式</Text>

        <View className="form-item">
          <Text className="form-label">联系人</Text>
          <Input
            className="form-input"
            placeholder="请输入联系人姓名"
            maxlength={20}
            value={form.contactPerson}
            onInput={(e) => handleInputChange('contactPerson', e.detail.value)}
          />
        </View>

        <View className="form-item">
          <Text className="form-label">联系电话 *</Text>
          <Input
            className="form-input"
            type="number"
            placeholder="请输入联系电话"
            maxlength={11}
            value={form.contactPhone}
            onInput={(e) => handleInputChange('contactPhone', e.detail.value)}
          />
        </View>

        <View className="form-item">
          <Text className="form-label">紧急程度</Text>
          <Picker mode="selector" range={PRIORITIES} value={form.priority} onChange={handlePriorityChange}>
            <View className="form-picker">
              <Text>{PRIORITIES[form.priority]}</Text>
              <Text className="picker-arrow">▼</Text>
            </View>
          </Picker>
        </View>
      </View>

      {/* 提交按钮 */}
      <View className="submit-section">
        <View
          className={`submit-btn ${submitting ? 'disabled' : ''}`}
          onClick={handleSubmit}
        >
          <Text>{submitting ? '提交中...' : '提交报修'}</Text>
        </View>
      </View>
    </View>
  )
}
