"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle, Send, MessageSquare, Users, Shield, Heart } from "lucide-react"

export default function PublicForm() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    type: "",
    message: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [error, setError] = useState("")

  const messageTypes = [
    { value: "suggestion", label: "Sugestão", icon: "💡", color: "text-blue-600" },
    { value: "complaint", label: "Reclamação", icon: "⚠️", color: "text-orange-600" },
    { value: "compliment", label: "Elogio", icon: "👏", color: "text-green-600" },
    { value: "report", label: "Denúncia", icon: "🚨", color: "text-red-600" },
    { value: "other", label: "Outro", icon: "💬", color: "text-gray-600" },
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!formData.message.trim()) {
      setError("O campo mensagem é obrigatório")
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch("https://ouvidoria-api-production.up.railway.app/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name || undefined,
          email: formData.email || undefined,
          type: formData.type || "other",
          content: formData.message,
        }),
      })

      if (response.ok) {
        setShowSuccess(true)
        setFormData({ name: "", email: "", type: "", message: "" })
        setTimeout(() => setShowSuccess(false), 5000)
      } else {
        const errorData = await response.json()
        setError(errorData.message || "Erro ao enviar mensagem. Tente novamente.")
      }
    } catch (err) {
      setError("Erro de conexão. Verifique sua internet e tente novamente.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <div className="p-4 bg-white/10 rounded-full backdrop-blur-sm">
                <MessageSquare className="w-12 h-12" />
              </div>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
              Envie sua sugestão,
              <br />
              <span className="text-blue-200">crítica ou elogio</span>
            </h1>
            <p className="text-xl sm:text-2xl text-blue-100 max-w-3xl mx-auto leading-relaxed">
              Sua opinião é importante para nós. Compartilhe suas ideias e experiências de forma segura e anônima.
            </p>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-blue-50 to-transparent"></div>
      </div>

      {/* Stats Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          <Card className="text-center p-6 shadow-lg border-0 bg-white/80 backdrop-blur-sm">
            <div className="flex justify-center mb-4">
              <div className="p-3 bg-blue-100 rounded-full">
                <Users className="w-8 h-8 text-blue-600" />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">100% Anônimo</h3>
            <p className="text-gray-600">Sua privacidade é garantida</p>
          </Card>
          <Card className="text-center p-6 shadow-lg border-0 bg-white/80 backdrop-blur-sm">
            <div className="flex justify-center mb-4">
              <div className="p-3 bg-green-100 rounded-full">
                <Shield className="w-8 h-8 text-green-600" />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Seguro</h3>
            <p className="text-gray-600">Dados protegidos e criptografados</p>
          </Card>
          <Card className="text-center p-6 shadow-lg border-0 bg-white/80 backdrop-blur-sm">
            <div className="flex justify-center mb-4">
              <div className="p-3 bg-purple-100 rounded-full">
                <Heart className="w-8 h-8 text-purple-600" />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Resposta Rápida</h3>
            <p className="text-gray-600">Retorno em até 48 horas</p>
          </Card>
        </div>
      </div>

      {/* Form Section */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        {showSuccess && (
          <div className="mb-8 animate-in slide-in-from-top-4 duration-500">
            <Alert className="border-green-200 bg-gradient-to-r from-green-50 to-emerald-50 shadow-lg">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <AlertDescription className="text-green-800 font-medium">
                ✨ Mensagem enviada com sucesso! Agradecemos seu feedback e retornaremos em breve.
              </AlertDescription>
            </Alert>
          </div>
        )}

        <Card className="shadow-2xl border-0 bg-white/90 backdrop-blur-sm">
          <CardHeader className="text-center pb-8">
            <CardTitle className="text-3xl font-bold text-gray-900 mb-4">Formulário de Contato</CardTitle>
            <CardDescription className="text-lg text-gray-600">
              Preencha os campos abaixo para enviar sua mensagem. Todos os campos são opcionais, exceto a mensagem.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-8">
            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-3 group">
                  <Label htmlFor="name" className="text-sm font-semibold text-gray-700 flex items-center">
                    👤 Nome (opcional)
                  </Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Como podemos te chamar?"
                    className="h-12 text-lg border-2 border-gray-200 focus:border-blue-500 transition-all duration-300 rounded-xl"
                  />
                </div>
                <div className="space-y-3 group">
                  <Label htmlFor="email" className="text-sm font-semibold text-gray-700 flex items-center">
                    📧 E-mail (opcional)
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="seu@email.com"
                    className="h-12 text-lg border-2 border-gray-200 focus:border-blue-500 transition-all duration-300 rounded-xl"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <Label htmlFor="type" className="text-sm font-semibold text-gray-700 flex items-center">
                  🏷️ Tipo da mensagem
                </Label>
                <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
                  <SelectTrigger className="h-12 text-lg border-2 border-gray-200 focus:border-blue-500 transition-all duration-300 rounded-xl">
                    <SelectValue placeholder="Selecione o tipo da sua mensagem" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    {messageTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value} className="text-lg py-3">
                        <div className="flex items-center space-x-3">
                          <span className="text-xl">{type.icon}</span>
                          <span className={`font-medium ${type.color}`}>{type.label}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3">
                <Label htmlFor="message" className="text-sm font-semibold text-gray-700 flex items-center">
                  ✍️ Mensagem <span className="text-red-500 ml-1">*</span>
                </Label>
                <Textarea
                  id="message"
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="Conte-nos o que você pensa... Seja específico e detalhado para que possamos te ajudar melhor."
                  className={`min-h-[150px] text-lg border-2 transition-all duration-300 rounded-xl resize-none ${
                    error && !formData.message.trim()
                      ? "border-red-500 focus:border-red-500"
                      : "border-gray-200 focus:border-blue-500"
                  }`}
                  required
                />
                <div className="flex justify-between items-center text-sm text-gray-500">
                  <span>Mínimo: 10 caracteres</span>
                  <span>{formData.message.length}/1000</span>
                </div>
              </div>

              {error && (
                <div className="animate-in slide-in-from-top-2 duration-300">
                  <Alert className="border-red-200 bg-gradient-to-r from-red-50 to-pink-50">
                    <AlertDescription className="text-red-800 font-medium flex items-center">
                      ⚠️ {error}
                    </AlertDescription>
                  </Alert>
                </div>
              )}

              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-[1.02] disabled:transform-none"
              >
                {isSubmitting ? (
                  <div className="flex items-center space-x-3">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Enviando sua mensagem...</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-3">
                    <Send className="w-5 h-5" />
                    <span>Enviar Mensagem</span>
                  </div>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Admin Link */}
        <div className="text-center mt-12">
          <div className="inline-flex items-center px-6 py-3 bg-white/80 backdrop-blur-sm rounded-full shadow-lg border border-gray-200">
            <Shield className="w-4 h-4 text-gray-500 mr-2" />
            <span className="text-sm text-gray-600 mr-2">Administrador?</span>
            <a
              href="/login"
              className="text-blue-600 hover:text-blue-700 font-semibold transition-colors duration-200 hover:underline"
            >
              Faça login aqui
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
