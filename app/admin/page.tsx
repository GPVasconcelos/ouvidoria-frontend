"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import {
  LogOut,
  Eye,
  Filter,
  Save,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  MessageSquare,
  TrendingUp,
  Clock,
  CheckCircle,
  Archive,
  BarChart3,
} from "lucide-react"

interface Message {
  id: string
  name?: string
  email?: string
  type: string
  content: string
  status: string
  createdAt: string
  adminResponse?: string
}

export default function AdminPanel() {
  const [messages, setMessages] = useState<Message[]>([])
  const [filteredMessages, setFilteredMessages] = useState<Message[]>([])
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null)
  const [filters, setFilters] = useState({
    type: "",
    status: "",
  })
  const [isLoading, setIsLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const router = useRouter()

  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const [totalItems, setTotalItems] = useState(0)

  const messageTypes = {
    suggestion: { label: "Sugestão", icon: "💡", color: "bg-blue-100 text-blue-800" },
    complaint: { label: "Reclamação", icon: "⚠️", color: "bg-orange-100 text-orange-800" },
    compliment: { label: "Elogio", icon: "👏", color: "bg-green-100 text-green-800" },
    report: { label: "Denúncia", icon: "🚨", color: "bg-red-100 text-red-800" },
    other: { label: "Outro", icon: "💬", color: "bg-gray-100 text-gray-800" },
  }

  const statusOptions = [
    { value: "received", label: "Recebido", icon: Clock, color: "bg-blue-100 text-blue-800" },
    { value: "analyzing", label: "Em Análise", icon: TrendingUp, color: "bg-yellow-100 text-yellow-800" },
    { value: "responded", label: "Respondido", icon: CheckCircle, color: "bg-green-100 text-green-800" },
    { value: "archived", label: "Arquivado", icon: Archive, color: "bg-gray-100 text-gray-800" },
  ]

  const getStatusBadge = (status: string) => {
    const statusConfig = statusOptions.find((s) => s.value === status) || statusOptions[0]
    const Icon = statusConfig.icon

    return (
      <Badge className={`${statusConfig.color} border-0 font-medium px-3 py-1`}>
        <Icon className="w-3 h-3 mr-1" />
        {statusConfig.label}
      </Badge>
    )
  }

  const getTypeDisplay = (type: string) => {
    const typeConfig = messageTypes[type as keyof typeof messageTypes] || messageTypes.other
    return (
      <Badge className={`${typeConfig.color} border-0 font-medium px-3 py-1`}>
        <span className="mr-1">{typeConfig.icon}</span>
        {typeConfig.label}
      </Badge>
    )
  }

  // Stats calculation
  const stats = {
    total: messages.length,
    received: messages.filter((m) => m.status === "received").length,
    analyzing: messages.filter((m) => m.status === "analyzing").length,
    responded: messages.filter((m) => m.status === "responded").length,
  }

  useEffect(() => {
    const token = localStorage.getItem("admin_token")
    if (!token) {
      router.push("/login")
      return
    }

    fetchMessages()
  }, [router])

  useEffect(() => {
    let filtered = messages

    if (filters.type) {
      filtered = filtered.filter((msg) => msg.type === filters.type)
    }

    if (filters.status) {
      filtered = filtered.filter((msg) => msg.status === filters.status)
    }

    setTotalItems(filtered.length)

    // Aplicar paginação
    const startIndex = (currentPage - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    const paginatedMessages = filtered.slice(startIndex, endIndex)

    setFilteredMessages(paginatedMessages)
  }, [messages, filters, currentPage, itemsPerPage])

  const fetchMessages = async () => {
    try {
      const token = localStorage.getItem("admin_token")
      const response = await fetch("https://ouvidoria-api-production.up.railway.app/admin/messages", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setMessages(data)
      } else if (response.status === 401) {
        handleLogout()
      } else {
        console.error("Erro ao carregar mensagens:", response.statusText)
      }
    } catch (err) {
      console.error("Erro ao carregar mensagens:", err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem("admin_token")
    router.push("/login")
  }

  const handleUpdateMessage = async () => {
    if (!selectedMessage) return

    try {
      const token = localStorage.getItem("admin_token")
      const response = await fetch(
        `https://ouvidoria-api-production.up.railway.app/admin/messages/${selectedMessage.id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            status: selectedMessage.status,
            adminResponse: selectedMessage.response,
          }),
        },
      )

      if (response.ok) {
        await fetchMessages()
        setIsDialogOpen(false)
        setSelectedMessage(null)
      } else {
        console.error("Erro ao atualizar mensagem:", response.statusText)
      }
    } catch (err) {
      console.error("Erro ao atualizar mensagem:", err)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const totalPages = Math.ceil(totalItems / itemsPerPage)
  const startItem = totalItems === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1
  const endItem = Math.min(currentPage * itemsPerPage, totalItems)

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  const handleItemsPerPageChange = (value: string) => {
    setItemsPerPage(Number(value))
    setCurrentPage(1)
  }

  useEffect(() => {
    setCurrentPage(1)
  }, [filters])

  const fetchMessageDetails = async (messageId: string) => {
    try {
      const token = localStorage.getItem("admin_token")
      const response = await fetch(`https://ouvidoria-api-production.up.railway.app/admin/messages/${messageId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setSelectedMessage(data)
      } else {
        console.error("Erro ao carregar detalhes da mensagem:", response.statusText)
      }
    } catch (err) {
      console.error("Erro ao carregar detalhes da mensagem:", err)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">Carregando painel...</h2>
          <p className="text-gray-600">Aguarde enquanto buscamos as mensagens</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <header className="bg-white shadow-lg border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-blue-100 rounded-lg">
                <MessageSquare className="w-8 h-8 text-blue-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Painel da Ouvidoria</h1>
                <p className="text-sm text-gray-600">Gerencie mensagens e feedbacks</p>
              </div>
            </div>
            <Button
              onClick={handleLogout}
              variant="outline"
              size="lg"
              className="border-2 hover:bg-red-50 hover:border-red-200 bg-transparent"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sair
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm font-medium">Total de Mensagens</p>
                  <p className="text-3xl font-bold">{stats.total}</p>
                </div>
                <BarChart3 className="w-8 h-8 text-blue-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-yellow-100 text-sm font-medium">Recebidas</p>
                  <p className="text-3xl font-bold">{stats.received}</p>
                </div>
                <Clock className="w-8 h-8 text-yellow-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-purple-500 to-indigo-500 text-white border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm font-medium">Em Análise</p>
                  <p className="text-3xl font-bold">{stats.analyzing}</p>
                </div>
                <TrendingUp className="w-8 h-8 text-purple-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-green-500 to-emerald-500 text-white border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm font-medium">Respondidas</p>
                  <p className="text-3xl font-bold">{stats.responded}</p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-200" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filtros */}
        <Card className="mb-8 shadow-lg border-0">
          <CardHeader className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-t-lg">
            <CardTitle className="flex items-center text-xl">
              <Filter className="w-6 h-6 mr-3 text-blue-600" />
              Filtros Avançados
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <Label className="text-sm font-semibold text-gray-700">Filtrar por Tipo</Label>
                <Select value={filters.type} onValueChange={(value) => setFilters({ ...filters, type: value })}>
                  <SelectTrigger className="h-12 border-2 border-gray-200 focus:border-blue-500 rounded-xl">
                    <SelectValue placeholder="Todos os tipos" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    <SelectItem value="all">Todos os tipos</SelectItem>
                    {Object.entries(messageTypes).map(([key, config]) => (
                      <SelectItem key={key} value={key} className="py-3">
                        <div className="flex items-center space-x-2">
                          <span>{config.icon}</span>
                          <span>{config.label}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-3">
                <Label className="text-sm font-semibold text-gray-700">Filtrar por Status</Label>
                <Select value={filters.status} onValueChange={(value) => setFilters({ ...filters, status: value })}>
                  <SelectTrigger className="h-12 border-2 border-gray-200 focus:border-blue-500 rounded-xl">
                    <SelectValue placeholder="Todos os status" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    <SelectItem value="all">Todos os status</SelectItem>
                    {statusOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value} className="py-3">
                        <div className="flex items-center space-x-2">
                          <option.icon className="w-4 h-4" />
                          <span>{option.label}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabela de Mensagens */}
        <Card className="shadow-xl border-0">
          <CardHeader className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-t-lg">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <CardTitle className="text-xl">Mensagens Recebidas ({totalItems})</CardTitle>
              <div className="flex items-center space-x-3">
                <Label htmlFor="itemsPerPage" className="text-sm font-medium whitespace-nowrap">
                  Itens por página:
                </Label>
                <Select value={itemsPerPage.toString()} onValueChange={handleItemsPerPageChange}>
                  <SelectTrigger className="w-20 h-10 border-2 border-gray-200 rounded-lg">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">5</SelectItem>
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="25">25</SelectItem>
                    <SelectItem value="50">50</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50/50">
                    <TableHead className="font-semibold text-gray-700 py-4">Tipo</TableHead>
                    <TableHead className="font-semibold text-gray-700 py-4">Nome</TableHead>
                    <TableHead className="font-semibold text-gray-700 py-4">E-mail</TableHead>
                    <TableHead className="font-semibold text-gray-700 py-4">Data</TableHead>
                    <TableHead className="font-semibold text-gray-700 py-4">Status</TableHead>
                    <TableHead className="font-semibold text-gray-700 py-4">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredMessages.map((message, index) => (
                    <TableRow
                      key={message.id}
                      className={`hover:bg-blue-50/50 transition-colors ${index % 2 === 0 ? "bg-white" : "bg-gray-50/30"}`}
                    >
                      <TableCell className="py-4">{getTypeDisplay(message.type)}</TableCell>
                      <TableCell className="py-4 font-medium">
                        {message.name || <span className="text-gray-400 italic">Anônimo</span>}
                      </TableCell>
                      <TableCell className="py-4">
                        {message.email || <span className="text-gray-400 italic">Não informado</span>}
                      </TableCell>
                      <TableCell className="py-4 text-sm text-gray-600">{formatDate(message.createdAt)}</TableCell>
                      <TableCell className="py-4">{getStatusBadge(message.status)}</TableCell>
                      <TableCell className="py-4">
                        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                          <DialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedMessage(message)
                                fetchMessageDetails(message.id)
                              }}
                              className="border-2 hover:bg-blue-50 hover:border-blue-200 transition-all duration-200"
                            >
                              <Eye className="w-4 h-4 mr-2" />
                              Ver detalhes
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                            <DialogHeader className="pb-6">
                              <DialogTitle className="text-2xl font-bold flex items-center">
                                <MessageSquare className="w-6 h-6 mr-3 text-blue-600" />
                                Detalhes da Mensagem
                              </DialogTitle>
                            </DialogHeader>
                            {selectedMessage && (
                              <div className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                  <div className="space-y-2">
                                    <Label className="text-sm font-semibold text-gray-700">Nome</Label>
                                    <div className="p-3 bg-gray-50 rounded-lg">
                                      <p className="text-gray-900">{selectedMessage.name || "Não informado"}</p>
                                    </div>
                                  </div>
                                  <div className="space-y-2">
                                    <Label className="text-sm font-semibold text-gray-700">E-mail</Label>
                                    <div className="p-3 bg-gray-50 rounded-lg">
                                      <p className="text-gray-900">{selectedMessage.email || "Não informado"}</p>
                                    </div>
                                  </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                  <div className="space-y-2">
                                    <Label className="text-sm font-semibold text-gray-700">Tipo</Label>
                                    <div className="p-3 bg-gray-50 rounded-lg">
                                      {getTypeDisplay(selectedMessage.type)}
                                    </div>
                                  </div>
                                  <div className="space-y-2">
                                    <Label className="text-sm font-semibold text-gray-700">Data</Label>
                                    <div className="p-3 bg-gray-50 rounded-lg">
                                      <p className="text-gray-900">{formatDate(selectedMessage.createdAt)}</p>
                                    </div>
                                  </div>
                                </div>

                                <div className="space-y-2">
                                  <Label className="text-sm font-semibold text-gray-700">Mensagem</Label>
                                  <div className="p-4 bg-blue-50 rounded-lg border-l-4 border-blue-500">
                                    <p className="text-gray-900 leading-relaxed">{selectedMessage.content}</p>
                                  </div>
                                </div>

                                <div className="space-y-3">
                                  <Label className="text-sm font-semibold text-gray-700">Status</Label>
                                  <Select
                                    value={selectedMessage.status}
                                    onValueChange={(value) => setSelectedMessage({ ...selectedMessage, status: value })}
                                  >
                                    <SelectTrigger className="h-12 border-2 border-gray-200 focus:border-blue-500 rounded-xl">
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent className="rounded-xl">
                                      {statusOptions.map((option) => (
                                        <SelectItem key={option.value} value={option.value} className="py-3">
                                          <div className="flex items-center space-x-2">
                                            <option.icon className="w-4 h-4" />
                                            <span>{option.label}</span>
                                          </div>
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </div>

                                <div className="space-y-3">
                                  <Label className="text-sm font-semibold text-gray-700">Resposta Administrativa</Label>
                                  <Textarea
                                    value={selectedMessage.adminResponse || ""}
                                    onChange={(e) =>
                                      setSelectedMessage({ ...selectedMessage, response: e.target.value })
                                    }
                                    placeholder="Digite uma resposta ou observação interna..."
                                    className="min-h-[120px] border-2 border-gray-200 focus:border-blue-500 rounded-xl resize-none"
                                  />
                                </div>

                                <Button
                                  onClick={handleUpdateMessage}
                                  className="w-full h-12 text-lg font-semibold bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 transition-all duration-300 rounded-xl shadow-lg hover:shadow-xl"
                                >
                                  <Save className="w-5 h-5 mr-2" />
                                  Salvar Alterações
                                </Button>
                              </div>
                            )}
                          </DialogContent>
                        </Dialog>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {filteredMessages.length === 0 && (
                <div className="text-center py-16">
                  <div className="flex flex-col items-center space-y-4">
                    <div className="p-4 bg-gray-100 rounded-full">
                      <MessageSquare className="w-12 h-12 text-gray-400" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">
                        {totalItems === 0 ? "Nenhuma mensagem encontrada" : "Nenhuma mensagem nesta página"}
                      </h3>
                      <p className="text-gray-600">
                        {totalItems === 0
                          ? "Ainda não há mensagens para exibir."
                          : "Tente ajustar os filtros ou navegar para outra página."}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Paginação */}
            {totalItems > 0 && (
              <div className="flex flex-col sm:flex-row justify-between items-center p-6 bg-gray-50/50 border-t gap-4">
                <div className="text-sm text-gray-600 font-medium">
                  Mostrando {startItem} a {endItem} de {totalItems} mensagens
                </div>

                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(1)}
                    disabled={currentPage === 1}
                    className="border-2 hover:bg-blue-50 hover:border-blue-200"
                  >
                    <ChevronsLeft className="w-4 h-4" />
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="border-2 hover:bg-blue-50 hover:border-blue-200"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>

                  <div className="flex items-center space-x-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNumber
                      if (totalPages <= 5) {
                        pageNumber = i + 1
                      } else if (currentPage <= 3) {
                        pageNumber = i + 1
                      } else if (currentPage >= totalPages - 2) {
                        pageNumber = totalPages - 4 + i
                      } else {
                        pageNumber = currentPage - 2 + i
                      }

                      return (
                        <Button
                          key={pageNumber}
                          variant={currentPage === pageNumber ? "default" : "outline"}
                          size="sm"
                          onClick={() => handlePageChange(pageNumber)}
                          className={`w-10 h-10 p-0 ${
                            currentPage === pageNumber
                              ? "bg-blue-600 hover:bg-blue-700"
                              : "border-2 hover:bg-blue-50 hover:border-blue-200"
                          }`}
                        >
                          {pageNumber}
                        </Button>
                      )
                    })}
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="border-2 hover:bg-blue-50 hover:border-blue-200"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(totalPages)}
                    disabled={currentPage === totalPages}
                    className="border-2 hover:bg-blue-50 hover:border-blue-200"
                  >
                    <ChevronsRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
