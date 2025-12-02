-- ============================================
-- FORÇAR CONFIRMAÇÃO DE TODOS OS EMAILS - VERSÃO SIMPLIFICADA
-- ============================================
-- Execute este script para FORÇAR confirmação de TODOS os emails
-- Isso resolve o problema de login mesmo com confirmação desabilitada

-- 1. FORÇAR confirmação de TODOS os emails existentes
UPDATE auth.users
SET email_confirmed_at = NOW()
WHERE email_confirmed_at IS NULL;

-- 2. Garantir que usuários criados no futuro também sejam confirmados automaticamente
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- FORÇA confirmação do email imediatamente após criação
  UPDATE auth.users
  SET email_confirmed_at = NOW()
  WHERE id = NEW.id;
  
  -- Garante que o perfil seja criado
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

-- 3. Recriar trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- 4. Função para confirmar email de um usuário específico (útil para casos individuais)
CREATE OR REPLACE FUNCTION public.confirm_user_email(user_email TEXT)
RETURNS BOOLEAN AS $$
DECLARE
  user_id UUID;
BEGIN
  SELECT id INTO user_id
  FROM auth.users
  WHERE email = LOWER(TRIM(user_email));
  
  IF user_id IS NULL THEN
    RETURN FALSE;
  END IF;
  
  UPDATE auth.users
  SET email_confirmed_at = NOW()
  WHERE id = user_id;
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Função melhorada para revalidar sessão
CREATE OR REPLACE FUNCTION public.revalidate_user_session(user_email TEXT)
RETURNS BOOLEAN AS $$
DECLARE
  user_id UUID;
BEGIN
  SELECT id INTO user_id
  FROM auth.users
  WHERE email = LOWER(TRIM(user_email));
  
  IF user_id IS NULL THEN
    RETURN FALSE;
  END IF;
  
  -- FORÇA confirmação
  UPDATE auth.users
  SET email_confirmed_at = NOW()
  WHERE id = user_id;
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. Verificar resultado - execute esta query para ver o status
SELECT 
  email,
  CASE 
    WHEN email_confirmed_at IS NULL THEN '❌ NÃO CONFIRMADO'
    ELSE '✅ CONFIRMADO'
  END as status,
  email_confirmed_at,
  created_at
FROM auth.users
ORDER BY created_at DESC;

-- ============================================
-- INSTRUÇÕES:
-- ============================================
-- 1. Execute este script completo no Supabase SQL Editor
-- 2. Verifique a última query - todos devem estar "✅ CONFIRMADO"
-- 3. Se algum ainda estiver "❌ NÃO CONFIRMADO", execute:
--    SELECT public.confirm_user_email('email@exemplo.com');
-- 4. Teste fazer login novamente
-- ============================================
