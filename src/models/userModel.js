import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please tell us your name'],
      minLength: [3, 'Name should be minimum 3 characters!'],
      maxLength: [30, 'Name should be maximum 30 characters!'],
    },

    email: {
      type: String,
      required: [true, 'Please provide your name'],
      unique: true,
      lowercase: true,
      validate: {
        validator: (v) =>
          /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(v),
      },
    },

    password: {
      type: String,
      required: [true, 'Password is required'],
      minLength: [6, 'Password should be minimum 6 characters!'],
    },

    passwordConfirm: {
      type: String,
      required: [true, 'Please confirm your password'],
      validate: {
        // This only works on CREATE and SAVE!!!
        validator: function (value) {
          return value === this.password;
        },
        message: 'Password are not the same!',
      },
    },

    photo: {
      type: String,
      default: '',
    },

    phone: {
      type: String,
      required: false,
    },

    role: {
      type: String,
      enum: ['user', 'instructor', 'admin'],
      default: 'user',
    },

    active: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// DOCUMENT MIDDLEWARE
// manipulate password
userSchema.pre('save', async function (next) {
  // Only run this function if password was actually modified
  if (!this.isModified('password')) return next();

  // Hash the password with cost of 8
  this.password = await bcrypt.hash(this.password, 8);

  // Delete passwordConfirm field
  this.passwordConfirm = undefined;

  next();
});

export const User = mongoose.models.User || mongoose.model('User', userSchema);
