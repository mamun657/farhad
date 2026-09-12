export const businessKnowledge = {
  name: 'Farhad Global Trade',
  founder: 'Mir Mohammed Farhad',
  role: 'Founder',
  tagline: 'Global Connections',
  timezone: 'Asia/Dhaka',
  phone: '+880 1884 821475',
  email: 'miafarhad01636@gmail.com',
  address: 'Oriant Tower (7th flood), Laldighir Uttar Par, Kotwali, Chittagong-4000, Bangladesh',
  openingHours: 'Current visiting and business availability is not listed. Please contact Farhad Global Trade for the latest availability.',
  location: {
    businessName: 'Farhad Global Trade',
    address: 'Oriant Tower (7th flood), Laldighir Uttar Par, Kotwali, Chittagong-4000, Bangladesh',
    googleMapsUrl: 'https://www.google.com/maps/search/?api=1&query=Oriant%20Tower%20(7th%20flood)%2C%20Laldighir%20Uttar%20Par%2C%20Kotwali%2C%20Chittagong-4000%2C%20Bangladesh',
  },
  categories: [
    'Automotive',
    'Consumer Electronics',
    'Mobile Accessories',
    'Fresh Fruits',
    'Cattle Feed',
  ],
  services: [
    'Global sourcing',
    'Import coordination',
    'Supply connections',
    'Business enquiries',
    'Dealer and customer support',
  ],
  sections: {
    Home: '#home',
    About: '#about',
    Products: '#products',
    Services: '#services',
    Contact: '#contact',
    Location: '#location',
  },
}

export function getLocationResponse() {
  return {
    message: `Farhad Global Trade is located at ${businessKnowledge.address}. You can use the location section below to open the address in Google Maps.`,
    link: {
      label: 'View Location',
      url: businessKnowledge.sections.Location,
    },
  }
}

export function getContactResponse() {
  return {
    message: `You can contact Farhad Global Trade at ${businessKnowledge.phone} or ${businessKnowledge.email}. The business address is ${businessKnowledge.address}.`,
    link: {
      label: 'Contact Farhad Global Trade',
      url: businessKnowledge.sections.Contact,
    },
  }
}

export function isContactQuestion(question = '') {
  return /(contact|phone|telephone|call|email|mail|founder|who is mir)/i.test(question)
}

export function getDhakaDateParts(date = new Date()) {
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: businessKnowledge.timezone,
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    hour12: false,
  })

  return formatter.formatToParts(date).reduce((parts, part) => {
    if (part.type !== 'literal') parts[part.type] = part.value
    return parts
  }, {})
}

export function getTodayOpeningWindow() {
  return { open: 'Business hours', close: 'By enquiry' }
}

export function getOpeningStatus(date = new Date()) {
  const dateParts = getDhakaDateParts(date)
  const weekday = dateParts.weekday

  return {
    day: weekday,
    date: `${dateParts.month} ${dateParts.day}, ${dateParts.year}`,
    isOpen: true,
    isClosedDay: false,
    message: `Our current visiting/business hours are not listed here. Please contact Farhad Global Trade at ${businessKnowledge.phone} or ${businessKnowledge.email} for the latest availability.`,
  }
}

export function isOpeningStatusQuestion(question = '') {
  return /(open|closed|close|hours|hour|opening|today|now|enquiry|what time|when can|availability|visiting hours)/i.test(question)
}

export function isLocationQuestion(question = '') {
  return /(location|where|address|where are you)/i.test(question)
}

export function isProductsQuestion(question = '') {
  return /(automotive|electronics|mobile|fruit|grapes|apples|cattle|feed|import|supply|product|dealer|source)/i.test(question)
}

export function getProductAnswer(question = '') {
  const text = String(question || '').toLowerCase()

  if (/(automotive|vehicle|engine|spare part|component)/.test(text)) {
    return 'Farhad Global Trade works across automotive products including imported vehicles, engines, spare parts and automotive components for the Bangladesh market.'
  }

  if (/(electronic|charger|headphone|earphone|mobile accessor|screen glass)/.test(text)) {
    return 'Our electronics and mobile accessory focus includes chargers, charging accessories, headphones, earphones and protective screen glass for everyday consumer needs.'
  }

  if (/(fresh fruit|apple|orange|malta|grape|fruit)/.test(text)) {
    return 'Farhad Global Trade sources fresh fruits including apples, oranges or malta, grapes and other applicable produce for the Bangladeshi market.'
  }

  if (/(cattle|feed|wheat bran|গরুর ভুসি|livestock)/.test(text)) {
    return 'The supply focus includes cattle feed and feed-related products such as wheat bran and other livestock feed needs.'
  }

  if (/(import|supply|source|global)/.test(text)) {
    return 'Farhad Global Trade connects international sourcing with local supply opportunities in Bangladesh through focused import and supply coordination.'
  }

  if (/(contact|enquiry|dealer|customer|business)/.test(text)) {
    return 'Please contact Farhad Global Trade directly for product sourcing, import and supply enquiries.'
  }

  return null
}
