export const officeHours = {
  Saturday: '9:30 AM – 10:00 PM',
  Sunday: '9:30 AM – 10:00 PM',
  Monday: '9:30 AM – 10:00 PM',
  Tuesday: '9:30 AM – 10:00 PM',
  Wednesday: '9:30 AM – 10:00 PM',
  Thursday: '9:30 AM – 10:00 PM',
  Friday: 'Closed',
}

const officeHoursSummary = 'Saturday–Thursday: 9:30 AM – 10:00 PM. Friday: Closed.'

export const businessKnowledge = {
  name: 'Farhad Global Trade',
  founder: 'Mir Mohammed Farhad',
  role: 'Founder',
  tagline: 'Global Connections',
  timezone: 'Asia/Dhaka',
  phone: '+880 1884 821475',
  email: 'miafarhad01636@gmail.com',
  address: 'Oriant Tower (7th floor), Laldighir Uttar Par, Kotwali, Chittagong-4000, Bangladesh',
  openingHours: officeHoursSummary,
  location: {
    businessName: 'Farhad Global Trade',
    address: 'Oriant Tower (7th floor), Laldighir Uttar Par, Kotwali, Chittagong-4000, Bangladesh',
    googleMapsUrl: 'https://maps.app.goo.gl/oDcrJf3x8gV6qAk87?g_st=aw',
  },
  categories: [
    'Automotive',
    'Engine & Spare Parts',
    'Consumer Electronics',
    'Mobile Accessories',
    'Fresh Fruits',
    'Cattle Feed',
    'Automotive Lubricants & Accessories',
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
    OfficeHours: '#office-hours',
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
  return { open: '9:30 AM', close: '10:00 PM' }
}

export function getOpeningStatus(question = '', date = new Date()) {
  const dateParts = getDhakaDateParts(date)
  const requestedDay = Object.keys(officeHours).find((day) => new RegExp(`\\b${day}\\b`, 'i').test(question))
  const weekday = requestedDay || dateParts.weekday
  const hours = officeHours[weekday] || officeHours.Saturday
  const isClosedDay = hours === 'Closed'
  const isSpecificDay = Boolean(requestedDay)

  let message
  if (isSpecificDay && isClosedDay) {
    message = 'Friday: Closed.\n\nOur office is open Saturday–Thursday from 9:30 AM to 10:00 PM.'
  } else if (isSpecificDay) {
    message = `${weekday}: ${hours}.\n\nView the full weekly schedule below.`
  } else if (/(today|now|are you open)/i.test(question)) {
    message = `${weekday}: ${hours}.\n\nOur office is open Saturday–Thursday from 9:30 AM to 10:00 PM.`
  } else {
    message = 'Our office is open Saturday–Thursday, 9:30 AM–10:00 PM.\nFriday is closed.\n\nYou can visit us during these hours.'
  }

  return {
    day: weekday,
    date: `${dateParts.month} ${dateParts.day}, ${dateParts.year}`,
    hours,
    isOpen: !isClosedDay,
    isClosedDay,
    message,
    link: {
      label: 'View Office Hours',
      url: businessKnowledge.sections.OfficeHours,
    },
  }
}

export function isOpeningStatusQuestion(question = '') {
  return /(open|closed|close|hours|hour|time|opening|closing|today|now|enquiry|what time|when can|when do you|availability|visiting|business hours|office time|office hours|friday office|saturday office)/i.test(question)
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
