"use client"

import type React from "react"
import { createContext, useContext, useState, useCallback } from "react"
import CardService from "../services/CardService"

interface MenuItem {
  _id: string
  name: string
  description: string
  price: number
  image: string
  category: string
  isAvailable: boolean
}

interface Menu {
  _id: string
  card: string
  title: string
  description: string
  items: MenuItem[]
  isActive: boolean
  displayOrder: number
  createdAt: string
  updatedAt: string
}

interface MenuContextType {
  menus: Menu[]
  currentMenu: Menu | null
  loading: boolean
  error: string | null
  fetchMenus: (cardId: string) => Promise<void>
  fetchMenu: (cardId: string, menuId: string) => Promise<void>
  createMenu: (cardId: string, menuData: Partial<Menu>) => Promise<Menu>
  updateMenu: (cardId: string, menuId: string, menuData: Partial<Menu>) => Promise<Menu>
  deleteMenu: (cardId: string, menuId: string) => Promise<void>
  createMenuItem: (cardId: string, menuId: string, itemData: Partial<MenuItem>) => Promise<void>
  updateMenuItem: (cardId: string, menuId: string, itemId: string, itemData: Partial<MenuItem>) => Promise<void>
  deleteMenuItem: (cardId: string, menuId: string, itemId: string) => Promise<void>
}

const MenuContext = createContext<MenuContextType | undefined>(undefined)

export const MenuProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [menus, setMenus] = useState<Menu[]>([])
  const [currentMenu, setCurrentMenu] = useState<Menu | null>(null)
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  const fetchMenus = useCallback(async (cardId: string) => {
    if (!cardId) return

    setLoading(true)
    setError(null)

    try {
      console.log("Fetching menus for cardId:", cardId)
      const response = await CardService.getCardMenus(cardId)
      console.log("Menus response:", response)

      // Set menus from the response
      if (response && Array.isArray(response.menus)) {
        setMenus(response.menus)
      } else {
        console.warn("Invalid menus response format:", response)
        setMenus([])
      }
    } catch (err) {
      console.error("Error fetching menus:", err)
      setError("Failed to fetch menus")
      setMenus([])
    } finally {
      setLoading(false)
    }
  }, [])

  const fetchMenu = useCallback(async (cardId: string, menuId: string) => {
    if (!cardId || !menuId) return

    setLoading(true)
    setError(null)

    try {
      const menu = await CardService.getMenuById(cardId, menuId)
      setCurrentMenu(menu)
    } catch (err) {
      console.error("Error fetching menu:", err)
      setError("Failed to fetch menu")
    } finally {
      setLoading(false)
    }
  }, [])

  const createMenu = async (cardId: string, menuData: Partial<Menu>) => {
    setLoading(true)
    setError(null)

    try {
      const newMenu = await CardService.createMenu(cardId, menuData)
      setMenus((prevMenus) => [...prevMenus, newMenu])
      return newMenu
    } catch (err) {
      console.error("Error creating menu:", err)
      setError("Failed to create menu")
      throw err
    } finally {
      setLoading(false)
    }
  }

  const updateMenu = async (cardId: string, menuId: string, menuData: Partial<Menu>) => {
    setLoading(true)
    setError(null)

    try {
      const updatedMenu = await CardService.updateMenu(cardId, menuId, menuData)
      setMenus((prevMenus) => prevMenus.map((menu) => (menu._id === menuId ? updatedMenu : menu)))
      if (currentMenu && currentMenu._id === menuId) {
        setCurrentMenu(updatedMenu)
      }
      return updatedMenu
    } catch (err) {
      console.error("Error updating menu:", err)
      setError("Failed to update menu")
      throw err
    } finally {
      setLoading(false)
    }
  }

  const deleteMenu = async (cardId: string, menuId: string) => {
    setLoading(true)
    setError(null)

    try {
      await CardService.deleteMenu(cardId, menuId)
      setMenus((prevMenus) => prevMenus.filter((menu) => menu._id !== menuId))
      if (currentMenu && currentMenu._id === menuId) {
        setCurrentMenu(null)
      }
    } catch (err) {
      console.error("Error deleting menu:", err)
      setError("Failed to delete menu")
      throw err
    } finally {
      setLoading(false)
    }
  }

  const createMenuItem = async (cardId: string, menuId: string, itemData: Partial<MenuItem>) => {
    setLoading(true)
    setError(null)

    try {
      await CardService.createMenuItem(cardId, menuId, itemData)
      // Refresh the menu to get updated items
      const updatedMenu = await CardService.getMenuById(cardId, menuId)
      setCurrentMenu(updatedMenu)
      setMenus((prevMenus) => prevMenus.map((menu) => (menu._id === menuId ? updatedMenu : menu)))
    } catch (err) {
      console.error("Error creating menu item:", err)
      setError("Failed to create menu item")
      throw err
    } finally {
      setLoading(false)
    }
  }

  const updateMenuItem = async (cardId: string, menuId: string, itemId: string, itemData: Partial<MenuItem>) => {
    setLoading(true)
    setError(null)

    try {
      await CardService.updateMenuItem(cardId, menuId, itemId, itemData)
      // Refresh the menu to get updated items
      const updatedMenu = await CardService.getMenuById(cardId, menuId)
      setCurrentMenu(updatedMenu)
      setMenus((prevMenus) => prevMenus.map((menu) => (menu._id === menuId ? updatedMenu : menu)))
    } catch (err) {
      console.error("Error updating menu item:", err)
      setError("Failed to update menu item")
      throw err
    } finally {
      setLoading(false)
    }
  }

  const deleteMenuItem = async (cardId: string, menuId: string, itemId: string) => {
    setLoading(true)
    setError(null)

    try {
      await CardService.deleteMenuItem(cardId, menuId, itemId)
      // Refresh the menu to get updated items
      const updatedMenu = await CardService.getMenuById(cardId, menuId)
      setCurrentMenu(updatedMenu)
      setMenus((prevMenus) => prevMenus.map((menu) => (menu._id === menuId ? updatedMenu : menu)))
    } catch (err) {
      console.error("Error deleting menu item:", err)
      setError("Failed to delete menu item")
      throw err
    } finally {
      setLoading(false)
    }
  }

  return (
    <MenuContext.Provider
      value={{
        menus,
        currentMenu,
        loading,
        error,
        fetchMenus,
        fetchMenu,
        createMenu,
        updateMenu,
        deleteMenu,
        createMenuItem,
        updateMenuItem,
        deleteMenuItem,
      }}
    >
      {children}
    </MenuContext.Provider>
  )
}

export const useMenu = () => {
  const context = useContext(MenuContext)
  if (context === undefined) {
    throw new Error("useMenu must be used within a MenuProvider")
  }
  return context
}

