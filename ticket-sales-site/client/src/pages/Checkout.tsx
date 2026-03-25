import { useState } from 'react';
import { ChevronLeft, Lock, CreditCard, User, Mail, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function Checkout() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    cardNumber: '',
    cardName: '',
    expiryDate: '',
    cvv: '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (step === 1) {
      setStep(2);
    } else {
      alert('Pedido confirmado! Você receberá um email com seus ingressos.');
    }
  };

  const eventTotal = 89.9 * 2;
  const tax = eventTotal * 0.1;
  const total = eventTotal + tax;

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      <main className="flex-1">
        <div className="container mx-auto px-4 py-12">
          {/* Breadcrumb */}
          <button className="flex items-center gap-2 text-[#0F3460] hover:text-[#D4AF37] transition-colors mb-8">
            <ChevronLeft className="w-5 h-5" />
            <span>Voltar</span>
          </button>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-2xl shadow-lg p-8">
                {/* Step Indicator */}
                <div className="flex gap-4 mb-8">
                  <div className={`flex-1 h-2 rounded-full transition-colors ${step >= 1 ? 'bg-[#0F3460]' : 'bg-gray-200'}`} />
                  <div className={`flex-1 h-2 rounded-full transition-colors ${step >= 2 ? 'bg-[#0F3460]' : 'bg-gray-200'}`} />
                </div>

                <form onSubmit={handleSubmit}>
                  {/* Step 1: Personal Information */}
                  {step === 1 && (
                    <div>
                      <h2 className="heading text-[#0F3460] mb-6">Informações Pessoais</h2>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            <User className="w-4 h-4 inline mr-2" />
                            Primeiro Nome
                          </label>
                          <input
                            type="text"
                            name="firstName"
                            value={formData.firstName}
                            onChange={handleInputChange}
                            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#0F3460]"
                            placeholder="João"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">Último Nome</label>
                          <input
                            type="text"
                            name="lastName"
                            value={formData.lastName}
                            onChange={handleInputChange}
                            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#0F3460]"
                            placeholder="Silva"
                            required
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            <Mail className="w-4 h-4 inline mr-2" />
                            Email
                          </label>
                          <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#0F3460]"
                            placeholder="joao@example.com"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            <Phone className="w-4 h-4 inline mr-2" />
                            Telefone
                          </label>
                          <input
                            type="tel"
                            name="phone"
                            value={formData.phone}
                            onChange={handleInputChange}
                            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#0F3460]"
                            placeholder="(95) 98765-4321"
                            required
                          />
                        </div>
                      </div>

                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                        <p className="text-sm text-blue-800">
                          ✓ Seus dados estão protegidos com criptografia SSL de 256 bits
                        </p>
                      </div>

                      <Button
                        type="submit"
                        className="w-full bg-[#0F3460] text-white hover:bg-[#0D2A47] font-semibold py-3"
                      >
                        Continuar para Pagamento
                      </Button>
                    </div>
                  )}

                  {/* Step 2: Payment Information */}
                  {step === 2 && (
                    <div>
                      <h2 className="heading text-[#0F3460] mb-6">Informações de Pagamento</h2>

                      <div className="mb-6">
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          <CreditCard className="w-4 h-4 inline mr-2" />
                          Número do Cartão
                        </label>
                        <input
                          type="text"
                          name="cardNumber"
                          value={formData.cardNumber}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#0F3460]"
                          placeholder="1234 5678 9012 3456"
                          required
                        />
                      </div>

                      <div className="mb-6">
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Nome no Cartão</label>
                        <input
                          type="text"
                          name="cardName"
                          value={formData.cardName}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#0F3460]"
                          placeholder="JOÃO SILVA"
                          required
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4 mb-6">
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">Validade (MM/AA)</label>
                          <input
                            type="text"
                            name="expiryDate"
                            value={formData.expiryDate}
                            onChange={handleInputChange}
                            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#0F3460]"
                            placeholder="12/26"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">CVV</label>
                          <input
                            type="text"
                            name="cvv"
                            value={formData.cvv}
                            onChange={handleInputChange}
                            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#0F3460]"
                            placeholder="123"
                            required
                          />
                        </div>
                      </div>

                      <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6 flex items-start gap-3">
                        <Lock className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                        <p className="text-sm text-green-800">
                          Pagamento seguro. Seus dados de cartão não são armazenados em nossos servidores.
                        </p>
                      </div>

                      <div className="flex gap-4">
                        <Button
                          type="button"
                          onClick={() => setStep(1)}
                          variant="outline"
                          className="flex-1 py-3"
                        >
                          Voltar
                        </Button>
                        <Button
                          type="submit"
                          className="flex-1 bg-[#D4AF37] text-[#0F3460] hover:bg-white font-semibold py-3"
                        >
                          Confirmar Pedido
                        </Button>
                      </div>
                    </div>
                  )}
                </form>
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl shadow-lg p-8 sticky top-24">
                <h3 className="heading text-[#0F3460] mb-6">Resumo do Pedido</h3>

                <div className="space-y-4 mb-6 pb-6 border-b border-gray-200">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Experiência Premium - Pôr do Sol</span>
                    <span className="font-semibold text-[#0F3460]">2x</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">R$ 89,90 cada</span>
                    <span className="font-semibold text-[#0F3460]">R$ {eventTotal.toFixed(2)}</span>
                  </div>
                </div>

                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal</span>
                    <span>R$ {eventTotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Taxas (10%)</span>
                    <span>R$ {tax.toFixed(2)}</span>
                  </div>
                </div>

                <div className="border-t border-gray-200 pt-4">
                  <div className="flex justify-between text-lg font-bold text-[#0F3460]">
                    <span>Total</span>
                    <span>R$ {total.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
