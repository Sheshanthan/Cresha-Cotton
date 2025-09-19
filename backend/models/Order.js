const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  designerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  contactNumber: {
    type: String,
    required: true
  },
  deliveryLocation: {
    type: String,
    required: true
  },
  address: {
    type: String,
    default: ''
  },
  location: {
    lat: {
      type: Number,
      required: false,
      default: 0
    },
    lng: {
      type: Number,
      required: false,
      default: 0
    }
  },
  description: {
    type: String,
    default: ''
  },
  gender: {
    type: String,
    enum: ['male', 'female', 'unisex'],
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  paymentMethod: {
    type: String,
    enum: ['cod', 'paynow'],
    required: true,
    default: 'cod'
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed'],
    default: 'pending'
  },
  stripePaymentId: {
    type: String,
    default: null
  },
  paidAt: {
    type: Date,
    default: null
  },
  fabricType: {
    type: String,
    enum: ['cotton', 'linen', 'silk', 'denim', 'rayon', 'polyester'],
    required: false
  },
  color: {
    type: String,
    enum: ['black', 'white', 'blue', 'red', 'green', 'yellow', 'purple', 'orange', 'pink', 'brown', 'gray', 'navy', 'maroon', 'olive', 'teal', 'lime'],
    required: false
  },
  fit: {
    type: String,
    enum: ['fitted', 'regular', 'relaxed', 'baggy'],
    required: false
  },
  sizingType: {
    type: String,
    enum: ['standard', 'custom'],
    required: false
  },
  standardSize: {
    type: String,
    enum: ['S', 'M', 'L', 'XL'],
    required: false
  },
  customMeasurements: {
    chest: Number,
    waist: Number,
    length: Number,
    shoulder: Number
  },
  collarStyle: {
    type: String,
    enum: ['spread', 'point', 'button-down', 'mandarin', 'wing'],
    required: false
  },
  cuffType: {
    type: String,
    enum: ['single', 'french', 'barrel', 'round'],
    required: false
  },
  pocketStyle: {
    type: String,
    enum: ['flap', 'patch', 'no-pocket', 'slanted'],
    required: false
  },
  trouserFit: {
    type: String,
    enum: ['straight', 'slim', 'tapered', 'bootcut', 'relaxed'],
    required: false
  },
  jacketStyle: {
    type: String,
    enum: ['single-breasted', 'double-breasted'],
    required: false
  },
  buttonCount: {
    type: String,
    required: false
  },
  sleeveStyle: {
    type: String,
    enum: ['sleeveless', 'capped', 'short', 'three-quarter', 'full', 'bell', 'puff'],
    required: false
  },
  neckline: {
    type: String,
    enum: ['crew', 'v-neck', 'scoop', 'halter', 'strapless', 'off-shoulder'],
    required: false
  },
  hemline: {
    type: String,
    enum: ['cropped', 'tunic', 'asymmetrical', 'high-low', 'curved'],
    required: false
  },
  dressLength: {
    type: String,
    enum: ['mini', 'knee-length', 'midi', 'maxi'],
    required: false
  },
  closure: {
    type: String,
    enum: ['buttons', 'zipper', 'snap', 'lace-up'],
    required: false
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'in_production', 'ready_for_delivery', 'delivered', 'cancelled'],
    default: 'pending'
  },
  orderDate: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Order', orderSchema); 