
// At the very top of the file
console.log('--- DEBUG: [CONTROLLER] userController.js - START ---');

let User;
try {
  const userModelModule = require('../models/UserModel');
  User = userModelModule.User; 

  if (!User) {
    console.error('--- DEBUG: [CONTROLLER] CRITICAL: User model is UNDEFINED after requiring from ../models/UserModel.js! Check UserModel.js export.');
  } else {
    console.log('--- DEBUG: [CONTROLLER] User model appears to be loaded/defined. Type:', typeof User);
  }
} catch (e) {
  console.error('--- DEBUG: [CONTROLLER] CRITICAL: ERROR occurred while requiring ../models/UserModel.js ---', e.message, e.stack);
}

// Get all users
exports.getAllUsers = async (req, res) => {
  console.log('--- DEBUG: [CONTROLLER] getAllUsers - Handler called ---');
  if (!User) {
    console.error('--- DEBUG: [CONTROLLER] getAllUsers - User model is not available!');
    return res.status(500).json({ message: 'Server configuration error: User model not loaded.' });
  }
  try {
    console.log('--- DEBUG: [CONTROLLER] getAllUsers - Executing User.find()');
    const users = await User.find().select('-passwordHash'); // Exclude password hash
    console.log('--- DEBUG: [CONTROLLER] getAllUsers - User.find() returned, count:', users.length);
    res.json(users);
  } catch (err) {
    console.error('--- DEBUG: [CONTROLLER] Error in getAllUsers:', err.message, err.stack);
    res.status(500).json({ message: 'Server error while fetching users' });
  }
};
console.log('--- DEBUG: [CONTROLLER] Assigned exports.getAllUsers. Type:', typeof exports.getAllUsers);


// Get a user by ID
exports.getUserById = async (req, res) => {
  console.log('--- DEBUG: [CONTROLLER] getUserById - Handler called for ID:', req.params.id);
  if (!User) {
    console.error('--- DEBUG: [CONTROLLER] getUserById - User model is not available!');
    return res.status(500).json({ message: 'Server configuration error: User model not loaded.' });
  }
  try {
    const user = await User.findById(req.params.id).select('-passwordHash');
    if (!user) {
      console.log('--- DEBUG: [CONTROLLER] getUserById - User not found for ID:', req.params.id);
      return res.status(404).json({ message: 'User not found' });
    }
    console.log('--- DEBUG: [CONTROLLER] getUserById - User found:', user.name);
    res.json(user);
  } catch (err) {
    console.error('--- DEBUG: [CONTROLLER] Error in getUserById:', err.message, err.stack);
    if (err.kind === 'ObjectId') {
        return res.status(404).json({ message: 'User not found (invalid ID format)' });
    }
    res.status(500).json({ message: 'Server error while fetching user' });
  }
};
console.log('--- DEBUG: [CONTROLLER] Assigned exports.getUserById. Type:', typeof exports.getUserById);

// Update a user by ID
exports.updateUserById = async (req, res) => {
  console.log('--- DEBUG: [CONTROLLER] updateUserById - Handler called for ID:', req.params.id, 'with body:', req.body);
  if (!User) {
    console.error('--- DEBUG: [CONTROLLER] updateUserById - User model is not available!');
    return res.status(500).json({ message: 'Server configuration error: User model not loaded.' });
  }
  try {
    // Prevent updating sensitive or immutable fields directly via this generic endpoint
    const { email, passwordHash, role, ...allowedUpdates } = req.body; 
    if (Object.keys(allowedUpdates).length === 0) {
        return res.status(400).json({ message: 'No update data provided or only disallowed fields were sent.' });
    }

    // Add more specific validation for fields in allowedUpdates if needed
    // e.g. if (allowedUpdates.name && typeof allowedUpdates.name !== 'string') ...

    const user = await User.findByIdAndUpdate(req.params.id, { $set: allowedUpdates }, { new: true, runValidators: true }).select('-passwordHash');
    if (!user) {
      console.log('--- DEBUG: [CONTROLLER] updateUserById - User not found for ID:', req.params.id);
      return res.status(404).json({ message: 'User not found' });
    }
    console.log('--- DEBUG: [CONTROLLER] updateUserById - User updated:', user.name);
    res.json(user);
  } catch (err) {
    console.error('--- DEBUG: [CONTROLLER] Error in updateUserById:', err.message, err.stack);
    if (err.kind === 'ObjectId') {
        return res.status(404).json({ message: 'User not found (invalid ID format)' });
    }
    if (err.name === 'ValidationError') {
        return res.status(400).json({ message: err.message });
    }
    res.status(500).json({ message: 'Server error while updating user' });
  }
};
console.log('--- DEBUG: [CONTROLLER] Assigned exports.updateUserById. Type:', typeof exports.updateUserById);

// Create a new user (example, if needed for registration)
exports.createUser = async (req, res) => {
  console.log('--- DEBUG: [CONTROLLER] createUser - Handler called with body:', req.body);
  if (!User) {
    console.error('--- DEBUG: [CONTROLLER] createUser - User model is not available!');
    return res.status(500).json({ message: 'Server configuration error: User model not loaded.' });
  }
  try {
    const { name, email, /* password, */ phone, role } = req.body; // Destructure expected fields
    if (!name || !email /*|| !password */) { // Password check removed for simplicity, add back with hashing
        return res.status(400).json({ message: 'Missing required fields: name, email.' }); // Add password if used
    }
    // In a real app, hash the password here:
    // const salt = await bcrypt.genSalt(10);
    // const passwordHash = await bcrypt.hash(password, salt);

    const newUser = new User({ 
        name, 
        email, 
        // passwordHash, 
        phone,
        role: role || 'customer' // Default role to customer if not provided
    });
    const savedUser = await newUser.save();
    
    const userResponse = savedUser.toObject();
    // delete userResponse.passwordHash; 
    
    console.log('--- DEBUG: [CONTROLLER] createUser - User created:', savedUser.name);
    res.status(201).json(userResponse);
  } catch (err) {
    console.error('--- DEBUG: [CONTROLLER] Error in createUser:', err.message, err.stack);
    if (err.code === 11000 && err.keyPattern && err.keyPattern.email) { // Duplicate email error
        return res.status(409).json({ message: 'User with this email already exists.' });
    }
    if (err.name === 'ValidationError') {
        return res.status(400).json({ message: err.message });
    }
    res.status(500).json({ message: 'Server error while creating user' });
  }
};
console.log('--- DEBUG: [CONTROLLER] Assigned exports.createUser. Type:', typeof exports.createUser);

// Delete a user by ID
exports.deleteUserById = async (req, res) => {
  console.log('--- DEBUG: [CONTROLLER] deleteUserById - Handler called for ID:', req.params.id);
  if (!User) {
    console.error('--- DEBUG: [CONTROLLER] deleteUserById - User model is not available!');
    return res.status(500).json({ message: 'Server configuration error: User model not loaded.' });
  }
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      console.log('--- DEBUG: [CONTROLLER] deleteUserById - User not found for ID:', req.params.id);
      return res.status(404).json({ message: 'User not found' });
    }
    console.log('--- DEBUG: [CONTROLLER] deleteUserById - User deleted:', user.name);
    // Consider what to do with user's orders, etc. or if this action is allowed.
    res.json({ message: 'User deleted successfully' });
  } catch (err) {
    console.error('--- DEBUG: [CONTROLLER] Error in deleteUserById:', err.message, err.stack);
    if (err.kind === 'ObjectId') {
        return res.status(404).json({ message: 'User not found (invalid ID format)' });
    }
    res.status(500).json({ message: 'Server error while deleting user' });
  }
};
console.log('--- DEBUG: [CONTROLLER] Assigned exports.deleteUserById. Type:', typeof exports.deleteUserById);


// At the very end of the file
console.log('--- DEBUG: [CONTROLLER] userController.js - END ---');
console.log('--- DEBUG: [CONTROLLER] Final module.exports keys for userController:', Object.keys(module.exports));
console.log('--- DEBUG: [CONTROLLER] module.exports itself for userController:', module.exports);
