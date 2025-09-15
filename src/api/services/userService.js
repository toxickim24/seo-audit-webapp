// User Management API Service
import apiClient from '../client'
import API_CONFIG from '../config'

class UserService {
  constructor() {
    this.endpoints = API_CONFIG.ENDPOINTS.USERS
  }

  // Create a new user
  async createUser(userData) {
    try {
      const response = await apiClient.post(this.endpoints.CREATE, userData)
      return {
        success: true,
        data: response.data,
        message: 'User created successfully'
      }
    } catch (error) {
      return {
        success: false,
        error: error.message,
        status: error.status
      }
    }
  }

  // Get user by ID
  async getUser(userId) {
    try {
      const response = await apiClient.get(this.endpoints.GET.replace(':id', userId))
      return {
        success: true,
        data: response.data
      }
    } catch (error) {
      return {
        success: false,
        error: error.message,
        status: error.status
      }
    }
  }

  // List users with filtering and pagination
  async listUsers(filters = {}, pagination = {}) {
    try {
      const params = {
        ...filters,
        page: pagination.page || 1,
        limit: pagination.limit || 20,
        sort: pagination.sort || 'created_at',
        order: pagination.order || 'desc'
      }
      
      const response = await apiClient.get(this.endpoints.LIST, params)
      return {
        success: true,
        data: response.data,
        pagination: response.pagination,
        total: response.total
      }
    } catch (error) {
      return {
        success: false,
        error: error.message,
        status: error.status
      }
    }
  }

  // Update user
  async updateUser(userId, updateData) {
    try {
      const response = await apiClient.put(
        this.endpoints.UPDATE.replace(':id', userId),
        updateData
      )
      return {
        success: true,
        data: response.data,
        message: 'User updated successfully'
      }
    } catch (error) {
      return {
        success: false,
        error: error.message,
        status: error.status
      }
    }
  }

  // Delete user
  async deleteUser(userId) {
    try {
      await apiClient.delete(this.endpoints.DELETE.replace(':id', userId))
      return {
        success: true,
        message: 'User deleted successfully'
      }
    } catch (error) {
      return {
        success: false,
        error: error.message,
        status: error.status
      }
    }
  }

  // User authentication
  async authenticate(credentials) {
    try {
      const response = await apiClient.post(this.endpoints.AUTH, credentials)
      
      // Store auth token
      if (response.data.token) {
        localStorage.setItem('auth_token', response.data.token)
        localStorage.setItem('user_data', JSON.stringify(response.data.user))
      }
      
      return {
        success: true,
        data: response.data,
        message: 'Authentication successful'
      }
    } catch (error) {
      return {
        success: false,
        error: error.message,
        status: error.status
      }
    }
  }

  // User logout
  async logout() {
    try {
      await apiClient.post('/users/logout')
      
      // Clear stored auth data
      localStorage.removeItem('auth_token')
      localStorage.removeItem('user_data')
      
      return {
        success: true,
        message: 'Logged out successfully'
      }
    } catch (error) {
      // Clear stored auth data even if API call fails
      localStorage.removeItem('auth_token')
      localStorage.removeItem('user_data')
      
      return {
        success: true,
        message: 'Logged out successfully'
      }
    }
  }

  // Get user profile
  async getProfile() {
    try {
      const response = await apiClient.get(this.endpoints.PROFILE)
      return {
        success: true,
        data: response.data
      }
    } catch (error) {
      return {
        success: false,
        error: error.message,
        status: error.status
      }
    }
  }

  // Update user profile
  async updateProfile(profileData) {
    try {
      const response = await apiClient.put(this.endpoints.PROFILE, profileData)
      
      // Update stored user data
      const currentUserData = JSON.parse(localStorage.getItem('user_data') || '{}')
      const updatedUserData = { ...currentUserData, ...response.data }
      localStorage.setItem('user_data', JSON.stringify(updatedUserData))
      
      return {
        success: true,
        data: response.data,
        message: 'Profile updated successfully'
      }
    } catch (error) {
      return {
        success: false,
        error: error.message,
        status: error.status
      }
    }
  }

  // Change password
  async changePassword(passwordData) {
    try {
      const response = await apiClient.post('/users/change-password', passwordData)
      return {
        success: true,
        message: 'Password changed successfully'
      }
    } catch (error) {
      return {
        success: false,
        error: error.message,
        status: error.status
      }
    }
  }

  // Reset password
  async resetPassword(email) {
    try {
      const response = await apiClient.post('/users/reset-password', { email })
      return {
        success: true,
        message: 'Password reset email sent'
      }
    } catch (error) {
      return {
        success: false,
        error: error.message,
        status: error.status
      }
    }
  }

  // Verify email
  async verifyEmail(token) {
    try {
      const response = await apiClient.post('/users/verify-email', { token })
      return {
        success: true,
        message: 'Email verified successfully'
      }
    } catch (error) {
      return {
        success: false,
        error: error.message,
        status: error.status
      }
    }
  }

  // Resend verification email
  async resendVerificationEmail() {
    try {
      const response = await apiClient.post('/users/resend-verification')
      return {
        success: true,
        message: 'Verification email sent'
      }
    } catch (error) {
      return {
        success: false,
        error: error.message,
        status: error.status
      }
    }
  }

  // Get user preferences
  async getUserPreferences() {
    try {
      const response = await apiClient.get('/users/preferences')
      return {
        success: true,
        data: response.data
      }
    } catch (error) {
      return {
        success: false,
        error: error.message,
        status: error.status
      }
    }
  }

  // Update user preferences
  async updateUserPreferences(preferences) {
    try {
      const response = await apiClient.put('/users/preferences', preferences)
      return {
        success: true,
        data: response.data,
        message: 'Preferences updated successfully'
      }
    } catch (error) {
      return {
        success: false,
        error: error.message,
        status: error.status
      }
    }
  }

  // Get user activity
  async getUserActivity(userId, filters = {}) {
    try {
      const params = { ...filters }
      const response = await apiClient.get(`/users/${userId}/activity`, params)
      return {
        success: true,
        data: response.data
      }
    } catch (error) {
      return {
        success: false,
        error: error.message,
        status: error.status
      }
    }
  }

  // Get user permissions
  async getUserPermissions(userId) {
    try {
      const response = await apiClient.get(`/users/${userId}/permissions`)
      return {
        success: true,
        data: response.data
      }
    } catch (error) {
      return {
        success: false,
        error: error.message,
        status: error.status
      }
    }
  }

  // Update user permissions
  async updateUserPermissions(userId, permissions) {
    try {
      const response = await apiClient.put(`/users/${userId}/permissions`, permissions)
      return {
        success: true,
        data: response.data,
        message: 'Permissions updated successfully'
      }
    } catch (error) {
      return {
        success: false,
        error: error.message,
        status: error.status
      }
    }
  }

  // Get user roles
  async getUserRoles() {
    try {
      const response = await apiClient.get('/users/roles')
      return {
        success: true,
        data: response.data
      }
    } catch (error) {
      return {
        success: false,
        error: error.message,
        status: error.status
      }
    }
  }

  // Assign user role
  async assignUserRole(userId, roleId) {
    try {
      const response = await apiClient.post(`/users/${userId}/roles`, { roleId })
      return {
        success: true,
        data: response.data,
        message: 'Role assigned successfully'
      }
    } catch (error) {
      return {
        success: false,
        error: error.message,
        status: error.status
      }
    }
  }

  // Remove user role
  async removeUserRole(userId, roleId) {
    try {
      await apiClient.delete(`/users/${userId}/roles/${roleId}`)
      return {
        success: true,
        message: 'Role removed successfully'
      }
    } catch (error) {
      return {
        success: false,
        error: error.message,
        status: error.status
      }
    }
  }

  // Get current user
  getCurrentUser() {
    try {
      const userData = localStorage.getItem('user_data')
      return userData ? JSON.parse(userData) : null
    } catch (error) {
      return null
    }
  }

  // Check if user is authenticated
  isAuthenticated() {
    return !!localStorage.getItem('auth_token')
  }

  // Get auth token
  getAuthToken() {
    return localStorage.getItem('auth_token')
  }
}

export default new UserService()
