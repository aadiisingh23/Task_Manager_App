import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/user.model.js';
import validator from 'validator'

const createToken = (userId) => {
    const secret = process.env.SECRET_KEY || 'change_me_strong_secret';
    return jwt.sign({ id: userId }, secret, { expiresIn: '7d' });
};

const cookieOptions = {
    httpOnly: true,
    secure: false,
    maxAge: 7 * 24 * 60 * 60 * 1000,
};

export const signup = async (req, res) => {
    try {
        const { name, email, password } = req.body;
        if (!name || !email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Name, email and password are required.'
            });
        }

        if (!validator.isEmail(email)) {
            return res.status(400).json({
                success: false,
                message: 'Name, email and password are required.'
            });
        }



        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(409).json({
                success: false,
                message: 'Email is already registered.'
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await User.create({
            name,
            email,
            password: hashedPassword
        });

        const token = createToken(user._id);
        res.cookie('token', token, cookieOptions);

        return res.status(201).json({
            success: true,
            user: { id: user._id, name: user.name, email: user.email },
            token,
        });
    } catch (error) {
        console.error('Signup error:', error);
        return res.status(500).json({
            success: false,
            message: 'Server error during signup.'
        });
    }
};

export const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required.', success: false });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ success: false, message: 'Invalid credentials.' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ success: false, message: 'Invalid credentials.' });
        }

        const token = createToken(user._id);
        res.cookie('token', token, cookieOptions);

        return res.json({
            success: true,
            user: { id: user._id, name: user.name, email: user.email },
            token,
        });
    } catch (error) {
        console.error('Login error:', error);
        return res.status(500).json({ error: 'Server error during login.' });
    }
};

export const logout = async (req, res) => {
    res.clearCookie('token', { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax' });
    return res.json({ success: true, message: 'Successfully logged out.' });
};

export const getCurrentUser = async (req, res) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }
    return res.json({ success: true, user });
  } catch (error) {
    console.error('Get User:', error);
    return res.status(500).json({ message: 'Server error during login.', success: false });
  }
};

export const updateUser = async (req, res) => {
  try {
    const { name, email } = req.body;
    const userId = req.user._id;

   
    if (!name && !email) {
      return res.status(400).json({
        success: false,
        message: 'At least one field (name or email) must be provided for update.'
      });
    }

   
    let updateData = {};
    if (name) {
      updateData.name = name.trim();
    }
    if (email) {
      if (!validator.isEmail(email)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid email format.'
        });
      }
      updateData.email = email.toLowerCase().trim();
    }

    
    if (email) {
      const existingUser = await User.findOne({
        email: email,
        _id: { $ne: userId }
      });
      if (existingUser) {
        return res.status(409).json({
          success: false,
          message: 'Email is already registered by another user.'
        });
      }
    }

    // Update user
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found.'
      });
    }

    return res.json({
      success: true,
      message: 'User updated successfully.',
      user: {
        id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email
      }
    });
  } catch (error) {
    console.error('Update user error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error during user update.'
    });
  }
};
