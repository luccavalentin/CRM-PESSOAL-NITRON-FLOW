/**
 * Script para importar leads de lojas em Piracicamirim
 * 
 * Execute: npx tsx scripts/import-leads-piracicamirim.ts
 * ou: node scripts/import-leads-piracicamirim.js (após compilar)
 */

import { supabase } from '../lib/supabase'
import { v4 as uuidv4 } from 'uuid'

// Dados fornecidos pelo usuário
const dadosLojas = `
3 kids Loja Infantil (19) 99917-9834
GICERI MODA ÍNTIMA (19) 97154-0690
Açougue Boi branco. Piracicaba sp (19) 3426-7495
Marinho Agropecuária e Pet Shop - Loja 3 (19) 3375-3325
Piracicaba Led (19) 99450-1587
Assaí Atacadista (19) 3401-2100
Corbella Tintas - Piracicaba 4 (19) 3374-4100
Guaili | Moda Praia e Fitness | Shopping Piracicaba (19) 3375-0178
Beauty Star Cosméticos & Perfumaria (19) 98338-6888
Impacto Som (19) 3411-8203
Floricultura Mary Clar (19) 99976-4459
Gran sabor (19) 99266-5962
Supermercado Beira Rio (19) 3447-4710
KMF Shopping das Baterias (19) 3411-1352
Paneteria Sol Nascente (19) 98373-0180
Cacau Show - Chocolates (19) 3428-1068
VL Aquarismo (19) 98147-9353
Alternativa calçados (19) 3426-3213
Loja Obramax Piracicaba (19) 3003-3400
Loja do Mecânico Piracicaba (19) 3052-8181
Pira Pisos - Pisos e Acabamentos (19) 3426-3820
Varejão Dois Irmãos (19) 3374-5040
Zastras Piracicaba (19) 99832-3909
Piracicaba Importados (19) 98706-3018
Mimo's Armarinho (19) 99652-2774
DiÂngeli (19) 3426-7684
Lm Closet Piracicaba (19) 99624-4905
RPM Store Plus Size (19) 98387-6910
Agropecuária do Mané Loja Dois Corregos (19) 3426-3485
JR Pankadão (19) 98171-2982
Posto GT Piracicamirim (19) 2532-0207
ADÃO SOM (19) 3411-1616
Tutti Frutti (19) 3426-7911
Depósito 23 - loja 2 (19) 3434-9003
Ótica Mercadão dos Óculos Piracicamirim - Piracicaba - SP (19) 99946-9449
Maskavo Churreria (19) 99629-0071
Encante Kids (19) 98830-5048
OXXO - Tapira 0800 747 6996
Ariane Modas (19) 3426-6461
Loja Pro Gamers (19) 99797-7795
Depósito Santa Rita de Piracicaba Materiais p/ Construção (19) 3426-0981
Ka Moto (19) 3426-7247
Suporte Smart Piracicaba - Piracicamirim (19) 99737-8054
Delta Supermercados Dois Córregos - Piracicaba (19) 3403-5591
O Boticário (19) 97422-2725
Fishing Express (19) 98172-9728
Pássaro e Cia Pet Shop/Banho e Tosa (19) 99801-9968
Laços de Fita - Piracicaba l Vila Rezende (19) 3413-3096
21k Calçados (19) 3426-1137
Paulistinha Cosméticos (19) 3927-2827
Água Viva Piscina - Loja Piracicaba (19) 3377-9009
E - Veste (19) 3377-2236
BW Papelaria (19) 3411-4827
Niquito Sports (19) 2533-1510
Balão Mágico Moda Infantil e juvenil (19) 99816-4120
Gygabon Piracicaba - Piracicamirim (19) 99978-7609
Point Cell (19) 97406-0276
Sousa Moto & Cia (19) 3426-5886
Betta Suplementos (19) 3374-4896
MaqClima Refrigeração (19) 99470-6010
Office Papelaria (19) 3375-6924
Utilitá Variedades Loja 2 (19) 3411-4188
CASA DAS CADEIRAS PIRACICABA (19) 98964-9288
Daaz Rolamentos Ferramentas e Parafusos (19) 3927-6353
Smoke Room Lounge E Tabacaria (19) 99964-9231
Enxovais Cravo e Canela (19) 3411-1794
Juguel Materiais de Construção (19) 3374-7330
Conveniencia Petromania (19) 3375-5554
Pinta Mundi Tintas Piracicaba (19) 98842-2233
Magnificat Joias (19) 98100-9667
Padaria Amizade 7 (19) 97165-1337
Maia eletrônicos e acessórios (19) 3927-1158
Vilaflex Colchões (19) 3371-4418
Gira Mundo Calçados (19) 99685-6262
Casa dos Pães - Padaria 24 horas (19) 3374-5136
Pedrinho Som, Sistema de Multimídia Alarmes e Travas Elétricas Piracicaba (19) 99728-5897
Ana Clothing Store (19) 99206-6439
Depósito de Bebidas Eskinão (19) 98460-1275
Simple Lines (19) 98346-6267
Lingerie em Piracicaba - Sedução Moda Íntima (19) 3432-1637
Impacto Tecidos (11) 91108-6051
JR Multimarcas (19) 3302-5255
Independencia Veiculos loja 3 (19) 3426-9050
Trok Pneus II - Revenda Michelin (19) 3413-7111
Lajes Vitória (19) 98329-3272
Comercial Artmaq (19) 3426-3998
HELTONCAR RECUPERADORA ESPECIALIZADA (19) 97149-7504
Geração do Som Piracicaba (19) 99189-7322
Shopping Piracicaba (19) 3372-9553
Manipulação Drogal (19) 3433-6490
Território Pet - Agropecuária e PetShop (19) 98258-0813
Puket (19) 3377-6199
Elymarry Cosméticos & Cia (19) 3426-6319
Espaço Malta Piracicaba (19) 99858-5957
MKL produto de limpeza (19) 99352-9462
Mugs Germânia (19) 99563-1341
Hausz Piracicaba (19) 99998-0195
Cervejaria Dama Bier (19) 3401-1766
Paulista Motos (19) 3426-8781
Musclefit Academia - Piracicamirim (19) 98983-5286
Loja Lurds Plus Size Piracicaba (19) 99188-0190
Atacadão - Piracicaba Piracicamirim (19) 3372-6169
Bazar Modelo Tecidos & Armarinhos (19) 3422-4241
Patotinha Store Piracicaba (19) 3432-1606
CENTRAL DE PROTEÇÃO (19) 2532-6070
Cresci e Perdi - Piracicaba (19) 3422-8148
Boneca de Pano Boutique (19) 3426-2579
Pipack Embalagens (19) 3371-8257
Laços de Fita - Piracicaba l Jd. Petrópolis (19) 3411-6148
Gustinho Eletroshow | Loja de Eletrônicos | Celular Xiaomi | Perfumes Importados | Iphone | Presentes | Piracicaba (19) 3426-3275
Flafer Dois Corregos (19) 2532-2660
Renata Modas (19) 3302-7251
Let Brinquedos - Loja 3 - Piracicamirim (19) 2533-0956
Papelaria Colegial (19) 3411-3727
Lojas CEM F260 (19) 3411-5193
ZEM STORE (19) 3036-2836
Passe Repasse Piracicaba (19) 3826-7388
Pira Cópias (19) 3422-2243
Chokodoce (19) 3371-4699
Tecnomania Games (19) 98225-3758
`

// Função para extrair nome e telefone de cada linha
function parseLinha(linha: string): { nome: string; telefone: string } | null {
  const linhaLimpa = linha.trim()
  if (!linhaLimpa) return null

  // Regex para encontrar telefone no formato (XX) XXXXX-XXXX ou (XX) XXXX-XXXX ou 0800 XXXX XXXX
  const telefoneRegex = /(\(?\d{2}\)?\s?\d{4,5}-?\d{4}|0800\s?\d{3}\s?\d{4})/
  const match = linhaLimpa.match(telefoneRegex)

  if (!match) {
    // Se não encontrar telefone, assume que toda a linha é o nome
    return { nome: linhaLimpa, telefone: '' }
  }

  const telefone = match[0].replace(/\s/g, '').replace(/[()]/g, '')
  const nome = linhaLimpa.replace(telefoneRegex, '').trim()

  return { nome, telefone }
}

// Função para formatar telefone
function formatarTelefone(telefone: string): string {
  if (!telefone) return ''
  // Remove espaços e caracteres especiais
  const limpo = telefone.replace(/\D/g, '')
  
  // Se for 0800
  if (limpo.startsWith('0800')) {
    return `0800 ${limpo.slice(4, 7)} ${limpo.slice(7)}`
  }
  
  // Formato padrão: (XX) XXXXX-XXXX ou (XX) XXXX-XXXX
  if (limpo.length === 10) {
    return `(${limpo.slice(0, 2)}) ${limpo.slice(2, 6)}-${limpo.slice(6)}`
  } else if (limpo.length === 11) {
    return `(${limpo.slice(0, 2)}) ${limpo.slice(2, 7)}-${limpo.slice(7)}`
  }
  
  return telefone
}

async function importarLeads() {
  console.log('🚀 Iniciando importação de leads...\n')

  // Parse dos dados
  const linhas = dadosLojas.split('\n').filter(linha => linha.trim())
  const leads: Array<{ nome: string; telefone: string }> = []

  for (const linha of linhas) {
    const parsed = parseLinha(linha)
    if (parsed && parsed.nome) {
      leads.push({
        nome: parsed.nome,
        telefone: formatarTelefone(parsed.telefone),
      })
    }
  }

  console.log(`📊 Total de leads encontrados: ${leads.length}\n`)

  // Preparar dados para inserção
  const leadsParaInserir = leads.map((lead) => ({
    id: uuidv4(),
    nome: lead.nome,
    telefone: lead.telefone || null,
    estado: 'SP',
    cidade: 'Piracicaba',
    bairro: 'Piracicamirim',
    nicho: 'Loja',
    status: 'Novo' as const,
    data_criacao: new Date().toISOString().split('T')[0],
    origem: 'Importação em massa',
    contactado: false,
    tem_site: null,
    lead_quente: false,
  }))

  // Inserir em lotes de 50 (limite do Supabase)
  const batchSize = 50
  let inseridos = 0
  let erros = 0

  for (let i = 0; i < leadsParaInserir.length; i += batchSize) {
    const batch = leadsParaInserir.slice(i, i + batchSize)
    
    try {
      const { data, error } = await supabase
        .from('leads')
        .insert(batch)
        .select()

      if (error) {
        console.error(`❌ Erro ao inserir lote ${Math.floor(i / batchSize) + 1}:`, error.message)
        erros += batch.length
      } else {
        inseridos += data?.length || 0
        console.log(`✅ Lote ${Math.floor(i / batchSize) + 1} inserido: ${data?.length || 0} leads`)
      }
    } catch (error: any) {
      console.error(`❌ Erro ao inserir lote ${Math.floor(i / batchSize) + 1}:`, error.message)
      erros += batch.length
    }
  }

  console.log('\n' + '='.repeat(50))
  console.log(`✅ Leads inseridos com sucesso: ${inseridos}`)
  if (erros > 0) {
    console.log(`❌ Erros: ${erros}`)
  }
  console.log('='.repeat(50))
}

// Executar
importarLeads()
  .then(() => {
    console.log('\n✨ Importação concluída!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n❌ Erro fatal:', error)
    process.exit(1)
  })

