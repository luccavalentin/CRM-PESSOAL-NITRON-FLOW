-- ============================================
-- CORREÇÃO: Confirmar emails automaticamente e corrigir autenticação
-- ============================================
-- Este script resolve o problema de login após cadastro
-- Execute este script no Supabase SQL Editor

-- 0. Garantir que a tabela usuarios existe (criar se não existir)
CREATE TABLE IF NOT EXISTS usuarios (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nome VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  status VARCHAR(20) DEFAULT 'Ativo' CHECK (status IN ('Ativo', 'Inativo')),
  plano VARCHAR(100),
  aplicativo_vinculado VARCHAR(255),
  data_registro TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  ultimo_acesso TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 1. Criar função para confirmar email automaticamente após registro
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Confirma o email automaticamente (apenas email_confirmed_at, confirmed_at é gerado automaticamente)
  UPDATE auth.users
  SET email_confirmed_at = COALESCE(email_confirmed_at, NOW())
  WHERE id = NEW.id;
  
  -- Garante que o perfil seja criado na tabela usuarios
  INSERT INTO usuarios (id, nome, email, status, data_registro)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'nome', split_part(NEW.email, '@', 1)),
    NEW.email,
    'Ativo',
    NOW()
  )
  ON CONFLICT (id) DO UPDATE
  SET 
    email = EXCLUDED.email,
    updated_at = NOW();
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Remover trigger antigo se existir
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- 3. Criar trigger para confirmar email automaticamente
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- 4. Atualizar TODOS os usuários existentes para terem email confirmado
-- Nota: confirmed_at é uma coluna gerada automaticamente, não pode ser atualizada manualmente
UPDATE auth.users
SET email_confirmed_at = COALESCE(email_confirmed_at, created_at)
WHERE email_confirmed_at IS NULL;

-- 5. Sincronizar dados de auth.users para usuarios (para usuários que não têm perfil)
INSERT INTO usuarios (id, nome, email, status, data_registro)
SELECT 
  au.id,
  COALESCE(au.raw_user_meta_data->>'nome', split_part(au.email, '@', 1)) as nome,
  au.email,
  'Ativo' as status,
  COALESCE(au.created_at, NOW()) as data_registro
FROM auth.users au
LEFT JOIN usuarios u ON u.id = au.id
WHERE u.id IS NULL
ON CONFLICT (id) DO UPDATE
SET 
  email = EXCLUDED.email,
  updated_at = NOW();

-- 6. Criar função para revalidar sessões (útil para debug)
CREATE OR REPLACE FUNCTION public.revalidate_user_session(user_email TEXT)
RETURNS BOOLEAN AS $$
DECLARE
  user_record auth.users%ROWTYPE;
BEGIN
  SELECT * INTO user_record
  FROM auth.users
  WHERE email = user_email;
  
  IF user_record.id IS NULL THEN
    RETURN FALSE;
  END IF;
  
  -- Confirma o email se não estiver confirmado (apenas email_confirmed_at)
  UPDATE auth.users
  SET email_confirmed_at = COALESCE(email_confirmed_at, NOW())
  WHERE id = user_record.id;
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- INSTRUÇÕES IMPORTANTES:
-- ============================================
-- 1. Execute este script no Supabase SQL Editor
-- 2. Vá no Supabase Dashboard > Authentication > Settings > Email Auth
-- 3. DESABILITE a opção "Confirm email" (ou "Enable email confirmations")
-- 4. Salve as alterações
-- 5. Teste criando um novo usuário e fazendo login
-- ============================================

-- Para testar se funcionou, execute:
-- SELECT email, email_confirmed_at, confirmed_at FROM auth.users;
-- Nota: confirmed_at é gerado automaticamente pelo Supabase baseado em email_confirmed_at
