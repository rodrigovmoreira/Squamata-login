import React, { useState, useEffect } from 'react';
import { Box, Flex, VStack, Heading, Text, Tabs, Input, Icon } from '@chakra-ui/react';
import { Button } from "../components/ui/button";
import { Field } from "../components/ui/field";
import { Toaster, toaster } from "../components/ui/toaster";
import { PasswordInput } from "../components/ui/password-input";
import { authAPI } from '../services/api';
import { useApp } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';
import { FcGoogle } from 'react-icons/fc';
import { FaUserShield } from 'react-icons/fa'; 

const Login = () => {
  const [loading, setLoading] = useState(false);
  const { dispatch } = useApp();
  const navigate = useNavigate();

  // Estados Dinâmicos (White-label mínimo)
  const [appSlug, setAppSlug] = useState('squamata-login');
  const [tenantId, setTenantId] = useState('default');

  // ==========================================
  // O "MOTOR DE CAPTURA" DO GOOGLE OAUTH
  // ==========================================
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    
    // Suporta os nomes que vêm do redirecionamento do backend
    const slugParams = params.get('appSlug') || params.get('app');
    const tenantParams = params.get('tenantId') || params.get('tenant');
    const token = params.get('token');
    const error = params.get('error');

    if (slugParams) setAppSlug(slugParams);
    if (tenantParams) setTenantId(tenantParams);

    // 1. Pista de Pouso: Captura o Token do Google
    if (token) {
      // Prioridade: localStorage (se iniciado por este nav) > query param
      const ssoTargetSlug = localStorage.getItem('sso_target_slug');
      const ssoTargetTenant = localStorage.getItem('sso_target_tenant');
      
      const finalSlug = ssoTargetSlug || slugParams || 'default';
      const finalTenant = ssoTargetTenant || tenantParams || 'default';

      try {
        let base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
        // Adicionando padding obrigatório para base64 puro caso a string jwt não caiba certinho em múltiplos de 4:
        while (base64.length % 4 !== 0) {
          base64 += '=';
        }

        const payload = JSON.parse(window.atob(base64));

        const user = { 
          id: payload.uid, 
          email: payload.email, 
          appSlug: finalSlug 
        };
        
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        dispatch({ type: 'SET_USER', payload: user });

        toaster.create({ title: `Acesso Autorizado via Google!`, type: "success" });
        
        // Redirecionamento SSO para Calango Food
        if (finalSlug === 'calango-food') {
          localStorage.removeItem('sso_target_slug');
          localStorage.removeItem('sso_target_tenant');
          window.location.href = `${import.meta.env.VITE_CALANGO_FOOD_URL || 'http://localhost:5173'}/auth/callback?token=${token}&user=${encodeURIComponent(JSON.stringify(user))}`;
          return;
        }

        // 2. Limpeza de Segurança (Apaga o token da URL)
        window.history.replaceState(
          {}, 
          document.title, 
          `${window.location.pathname}?app=${finalSlug}&tenant=${finalTenant}`
        );

      } catch (err) {
        console.error("Erro ao processar token do Google:", err);
      }
    }

    // 3. Captura de Erros
    if (error) {
      toaster.create({
        title: "Autenticação Cancelada",
        description: "Não foi possível autenticar com a conta Google.",
        type: "error"
      });
      window.history.replaceState(
        {}, 
        document.title, 
        `${window.location.pathname}?app=${slugParams || 'default'}&tenant=${tenantParams || 'default'}`
      );
    }
  }, [dispatch]);

  const appNameLabel = appSlug === 'calango-food' 
    ? 'Calango Food' 
    : appSlug === 'calango-bot' 
      ? 'Calango, Inc.' 
      : 'Calango, Inc.';

  const handleAuth = async (e, type) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData.entries());

    // Validação Estrita de E-mail
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(data.email)) {
      toaster.create({ title: "E-mail inválido", description: "Insira um formato válido.", type: "error" });
      setLoading(false);
      return;
    }

    if (type === 'register' && data.password !== data.confirmPassword) {
      toaster.create({ title: "As senhas não coincidem", type: "error" });
      setLoading(false);
      return;
    }

    const payload = { ...data, appSlug, tenantId };

    try {
      const response = type === 'login'
        ? await authAPI.login(payload)
        : await authAPI.register(payload);

      const { token, user } = response.data;
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      dispatch({ type: 'SET_USER', payload: user });

      toaster.create({ title: `Acesso Autorizado!`, type: "success" });
      
      // Redirecionamento SSO para Calango Food
      if (appSlug === 'calango-food') {
        window.location.href = `${import.meta.env.VITE_CALANGO_FOOD_URL || 'http://localhost:5173'}/auth/callback?token=${token}&user=${encodeURIComponent(JSON.stringify(user))}`;
        return;
      }
      
    } catch (err) {
      toaster.create({
        title: "Acesso Negado",
        description: err.response?.data?.message || "Permissão negada ou dados incorretos.",
        type: "error"
      });
    } finally { setLoading(false); }
  };

  return (
    <Flex flex={1} minH="100vh" direction={{ base: 'column', md: 'row' }}>
      <Toaster />
      
      {/* Lado Esquerdo */}
      <Flex flex={1} bgGradient="to-br" gradientFrom="green.500" gradientTo="purple.600" justify="center" align="center" direction="column" p={8} color="white">
        <VStack gap={6}>
          <Box bg="rgba(255, 255, 255, 0.2)" p={8} borderRadius="full" backdropFilter="blur(10px)" boxShadow="xl">
            <Icon as={FaUserShield} boxSize="100px" />
          </Box>
          <Heading size="3xl" fontWeight="bold" letterSpacing="tight">{appNameLabel}</Heading>
          <Text fontSize="xl" opacity={0.9}>Identidade e Acesso Centralizado</Text>
        </VStack>
      </Flex>

      {/* Lado Direito */}
      <Flex flex={1} bg="gray.50" justify="center" align="center" p={4}>
        <Box w="full" maxW="md" boxShadow="2xl" borderRadius="2xl" bg="white" p={8}>
            <Tabs.Root defaultValue="login" colorPalette="green" variant="enclosed">
                <Tabs.List w="full" mb={6}>
                    <Tabs.Trigger value="login" flex={1} py={3} fontWeight="bold">Login</Tabs.Trigger>
                    <Tabs.Trigger value="register" flex={1} py={3} fontWeight="bold">Novo Usuário</Tabs.Trigger>
                </Tabs.List>

                {/* Aba de Login */}
                <Tabs.Content value="login">
                    <form onSubmit={(e) => handleAuth(e, 'login')}>
                    <VStack gap={4} align="stretch">
                        <Heading size="md" textAlign="center" mb={2} color="gray.700">Bem-vindo(a)</Heading>
                        
                        <Button 
                          w="full" 
                          variant="outline" 
                          type="button" 
                          mb={2}
                          onClick={() => {
                            localStorage.setItem('sso_target_slug', appSlug);
                            localStorage.setItem('sso_target_tenant', tenantId);
                            const backendUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001/api/v1';
                            window.location.href = `${backendUrl}/auth/google?appSlug=${appSlug}&tenantId=${tenantId}`;
                          }}
                        >
                          <FcGoogle style={{ marginRight: '8px' }} /> Continuar com Google
                        </Button>
                        <Text fontSize="xs" color="gray.400" textAlign="center">Ou use seu e-mail</Text>

                        <Field label="E-mail">
                            <Input name="email" type="email" placeholder="seu@email.com" required color="gray.800" />
                        </Field>
                        <Field label="Senha">
                            <PasswordInput name="password" placeholder="Sua senha" required color="gray.800" />
                        </Field>
                        <Button type="submit" colorPalette="green" size="lg" loading={loading} mt={2}>Autenticar</Button>
                    </VStack>
                    </form>
                </Tabs.Content>

                {/* Aba de Registro */}
                <Tabs.Content value="register">
                    <form onSubmit={(e) => handleAuth(e, 'register')}>
                    <VStack gap={4} align="stretch">
                        <Heading size="md" textAlign="center" mb={2} color="gray.700">Criar Novo Usuário</Heading>
                        <Field label="Nome">
                            <Input name="name" placeholder="Seu nome" required color="gray.800" />
                        </Field>
                        <Field label="E-mail">
                            <Input name="email" type="email" placeholder="seu@email.com" required color="gray.800" />
                        </Field>
                        <Field label="Senha">
                            <PasswordInput name="password" placeholder="Mínimo 6 caracteres" required color="gray.800" />
                        </Field>
                        <Field label="Confirmar Senha">
                            <PasswordInput name="confirmPassword" placeholder="Repita a senha" required color="gray.800" />
                        </Field>
                        <Button type="submit" colorPalette="green" size="lg" loading={loading}>Criar & Acessar</Button>
                    </VStack>
                    </form>
                </Tabs.Content>
            </Tabs.Root>
            <Text fontSize="xs" color="gray.500" textAlign="center" mt={6}>Squamata Identity &copy; 2026</Text>
        </Box>
      </Flex>
    </Flex>
  );
};

export default Login;