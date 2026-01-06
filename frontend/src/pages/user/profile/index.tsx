import { View, Text, Input, Button, Image } from '@tarojs/components'
import { useState } from 'react'
import Taro from '@tarojs/taro'
import { useAuthStore } from '@/stores/useAuthStore'
import { updateProfile, uploadAvatar } from '@/services/user'
import './profile.scss'

export default function Profile() {
  const { userInfo, updateUserInfo } = useAuthStore()
  const [loading, setLoading] = useState(false)
  const [nickname, setNickname] = useState(userInfo?.nickname || '')

  const handleChooseAvatar = async () => {
    try {
      const res = await Taro.chooseImage({
        count: 1,
        sizeType: ['compressed'],
        sourceType: ['album', 'camera']
      })

      if (res.tempFilePaths.length > 0) {
        const tempPath = res.tempFilePaths[0]
        
        Taro.showLoading({ title: '上传中...' })
        
        const uploadRes = await uploadAvatar(tempPath)
        
        Taro.hideLoading()
        
        if (uploadRes.success && uploadRes.data) {
          updateUserInfo({ avatar: uploadRes.data.url })
          Taro.showToast({ title: '头像已更新', icon: 'success' })
        }
      }
    } catch (error: any) {
      Taro.hideLoading()
      Taro.showToast({ title: error.message || '上传失败', icon: 'none' })
    }
  }

  const handleSave = async () => {
    if (!nickname.trim()) {
      Taro.showToast({ title: '请输入昵称', icon: 'none' })
      return
    }

    setLoading(true)
    try {
      const res = await updateProfile({ nickname: nickname.trim() })
      
      if (res.success) {
        updateUserInfo({ nickname: nickname.trim() })
        Taro.showToast({
          title: '保存成功',
          icon: 'success'
        })
        setTimeout(() => {
          Taro.navigateBack()
        }, 1500)
      }
    } catch (error: any) {
      Taro.showToast({
        title: error.message || '保存失败',
        icon: 'none'
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <View className="profile-page">
      {/* 头像区域 */}
      <View className="avatar-section" onClick={handleChooseAvatar}>
        <View className="avatar-wrapper">
          {userInfo?.avatar ? (
            <Image className="avatar-image" src={userInfo.avatar} mode="aspectFill" />
          ) : (
            <View className="avatar-placeholder">
              <Text className="avatar-icon">👤</Text>
            </View>
          )}
          <View className="avatar-edit">
            <Text className="edit-icon">📷</Text>
          </View>
        </View>
        <Text className="avatar-tip">点击更换头像</Text>
      </View>

      {/* 表单区域 */}
      <View className="form-section">
        <View className="form-item">
          <Text className="form-label">昵称</Text>
          <Input
            className="form-input"
            placeholder="请输入昵称"
            maxlength={20}
            value={nickname}
            onInput={(e) => setNickname(e.detail.value)}
          />
        </View>

        <View className="form-item readonly">
          <Text className="form-label">手机号</Text>
          <Text className="form-value">
            {userInfo?.phone || '未绑定'}
          </Text>
          {!userInfo?.phone && (
            <Text className="form-action">去绑定</Text>
          )}
        </View>

        <View className="form-item readonly">
          <Text className="form-label">认证状态</Text>
          <Text className={`form-value status-${userInfo?.authStatus}`}>
            {userInfo?.authStatus === 'verified' ? '已认证' : 
             userInfo?.authStatus === 'pending' ? '审核中' : '未认证'}
          </Text>
        </View>

        {userInfo?.building && (
          <View className="form-item readonly">
            <Text className="form-label">住址</Text>
            <Text className="form-value">
              {userInfo.building}栋 {userInfo.unit}单元 {userInfo.room}室
            </Text>
          </View>
        )}
      </View>

      {/* 保存按钮 */}
      <View className="save-section">
        <Button
          className="save-button"
          loading={loading}
          onClick={handleSave}
        >
          {loading ? '保存中...' : '保存'}
        </Button>
      </View>
    </View>
  )
}
