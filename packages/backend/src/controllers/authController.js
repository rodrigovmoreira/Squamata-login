import User from '../models/User.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const generateToken = (user, appSlug, tenantId) => {
  return jwt.sign(
    { uid: user._id, email: user.email, appSlug, tenantId },
    process.env.JWT_SECRET || 'super_secret_jwt_key_calango_inc',
    { expiresIn: '1d' }
  );
};

export const register = async (req, res) => {
  try {
    const { name, email, password, appSlug, tenantId } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'E-mail já está em uso.' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const slug = appSlug || 'squamata';
    const tenant = tenantId || 'default';

    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      access: [{ appSlug: slug, tenantId: tenant }]
    });

    await newUser.save();

    const token = generateToken(newUser, slug, tenant);

    res.status(201).json({
      message: 'Usuário criado com sucesso',
      token,
      user: { id: newUser._id, name: newUser.name, email: newUser.email, access: newUser.access }
    });
  } catch (error) {
    console.error('Registration Error:', error);
    res.status(500).json({ message: 'Erro interno no servidor' });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password, appSlug, tenantId } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'Usuário não encontrado.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Credenciais inválidas.' });
    }

    const slug = appSlug || 'squamata';
    const tenant = tenantId || 'default';

    res.json({
      message: 'Login realizado com sucesso',
      token: generateToken(user, slug, tenant),
      user: { id: user._id, name: user.name, email: user.email, access: user.access }
    });

  } catch (error) {
    console.error('Login Error:', error);
    res.status(500).json({ message: 'Erro interno no servidor' });
  }
};

export const googleCallbackRedirect = (req, res) => {
  try {
    // O Passport já colocou o usuário autenticado/criado dentro de req.user
    const user = req.user;

    // Pegamos os dados que desempacotamos do 'state' lá na rota
    const slug = req.body.appSlug || 'squamata';
    const tenant = req.body.tenantId || 'default';

    // 1. Reutilizamos a sua função para gerar o token!
    const token = generateToken(user, slug, tenant);

    // 2. Definimos para onde o usuário deve voltar (Frontend)
    const frontendURL = process.env.FRONTEND_URL || 'http://localhost:5174';

    // 3. Redirecionamos o navegador, passando o token pela URL
    res.redirect(`${frontendURL}/login?token=${token}&appSlug=${slug}&tenant=${tenant}`);

  } catch (error) {
    console.error('Google Callback Error:', error);
    res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5174'}/login?error=OAuthFailed`);
  }
};