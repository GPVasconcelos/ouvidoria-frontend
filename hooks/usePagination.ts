"use client"

import { useState, useEffect } from "react"

interface PaginationOptions {
  initialPage?: number
  initialItemsPerPage?: number
}

interface PaginationInfo {
  currentPage: number
  totalPages: number
  totalItems: number
  itemsPerPage: number
  hasNextPage: boolean
  hasPreviousPage: boolean
}

export function usePagination(options: PaginationOptions = {}) {
  const { initialPage = 1, initialItemsPerPage = 10 } = options

  const [currentPage, setCurrentPage] = useState(initialPage)
  const [itemsPerPage, setItemsPerPage] = useState(initialItemsPerPage)
  const [paginationInfo, setPaginationInfo] = useState<PaginationInfo>({
    currentPage: initialPage,
    totalPages: 0,
    totalItems: 0,
    itemsPerPage: initialItemsPerPage,
    hasNextPage: false,
    hasPreviousPage: false,
  })

  const goToPage = (page: number) => {
    if (page >= 1 && page <= paginationInfo.totalPages) {
      setCurrentPage(page)
    }
  }

  const goToFirstPage = () => goToPage(1)
  const goToLastPage = () => goToPage(paginationInfo.totalPages)
  const goToNextPage = () => goToPage(currentPage + 1)
  const goToPreviousPage = () => goToPage(currentPage - 1)

  const changeItemsPerPage = (newItemsPerPage: number) => {
    setItemsPerPage(newItemsPerPage)
    setCurrentPage(1) // Reset to first page when changing items per page
  }

  const updatePaginationInfo = (info: Partial<PaginationInfo>) => {
    setPaginationInfo((prev) => ({ ...prev, ...info }))
  }

  // Reset to first page when items per page changes
  useEffect(() => {
    setCurrentPage(1)
  }, [itemsPerPage])

  const getPageNumbers = (maxVisible = 5): number[] => {
    const { totalPages } = paginationInfo

    if (totalPages <= maxVisible) {
      return Array.from({ length: totalPages }, (_, i) => i + 1)
    }

    const half = Math.floor(maxVisible / 2)
    let start = Math.max(currentPage - half, 1)
    const end = Math.min(start + maxVisible - 1, totalPages)

    if (end - start + 1 < maxVisible) {
      start = Math.max(end - maxVisible + 1, 1)
    }

    return Array.from({ length: end - start + 1 }, (_, i) => start + i)
  }

  return {
    currentPage,
    itemsPerPage,
    paginationInfo,
    goToPage,
    goToFirstPage,
    goToLastPage,
    goToNextPage,
    goToPreviousPage,
    changeItemsPerPage,
    updatePaginationInfo,
    getPageNumbers,
  }
}
