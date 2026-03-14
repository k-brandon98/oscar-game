const ACTING_CATEGORIES = new Set([
  'Actor in a Leading Role',
  'Actor in a Supporting Role',
  'Actress in a Leading Role',
  'Actress in a Supporting Role',
])

export function getImageSearchType(categoryName) {
  if (ACTING_CATEGORIES.has(categoryName) || categoryName === 'Best Director') {
    return 'person'
  }
  return 'movie'
}

export function getImageQuery(categoryName, nominee) {
  if (getImageSearchType(categoryName) === 'person') {
    return nominee.name
  }
  return nominee.movie || nominee.name
}

export function getNomineeText(categoryName, nominee) {
  if (categoryName === 'International Feature Film') {
    const parts = nominee.name.split('—')
    return parts.length > 1 ? parts[1].trim() : nominee.name
  }

  if (
    categoryName === 'Writing (Original Screenplay)' ||
    categoryName === 'Writing (Adapted Screenplay)' ||
    categoryName === 'Music (Original Score)'
  ) {
    const parts = nominee.name.split('—')
    return parts.length > 1 ? parts[0].trim() : nominee.name
  }

  return nominee.name
}

export function getNomineeSubtext(categoryName, nominee) {
  if (
    categoryName === 'Best Director' ||
    categoryName === 'Actor in a Leading Role' ||
    categoryName === 'Actor in a Supporting Role' ||
    categoryName === 'Actress in a Leading Role' ||
    categoryName === 'Actress in a Supporting Role'
  ) {
    return nominee.movie
  }

  if (
    categoryName === 'Writing (Original Screenplay)' ||
    categoryName === 'Writing (Adapted Screenplay)' ||
    categoryName === 'Music (Original Score)'
  ) {
    const parts = nominee.name.split('—')
    return parts.length > 1 ? parts[1].trim() : ''
  }

  if (categoryName === 'International Feature Film') {
    const parts = nominee.name.split('—')
    return parts.length > 1 ? parts[0].trim() : ''
  }

  return ''
}