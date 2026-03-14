export const BEST_PICTURE = 'Best Picture'

export const BEST_PICTURE_POINTS = [100, 50, 25, 10, 7, 4, 3, 2, 1, 0]
export const ATL_POINTS = [50, 25, 5, 3, 0]
export const BTL_POINTS = [25, 10, 3, 1, 0]

export const ATL_CATEGORIES = new Set([
  'Best Director',
  'Actor in a Leading Role',
  'Actress in a Leading Role',
  'Actor in a Supporting Role',
  'Actress in a Supporting Role',
  'Writing (Original Screenplay)',
  'Writing (Adapted Screenplay)',
])

export function pointsForPosition(category, position) {
  if (category === BEST_PICTURE) {
    return BEST_PICTURE_POINTS[position] ?? 0
  }

  if (ATL_CATEGORIES.has(category)) {
    return ATL_POINTS[position] ?? 0
  }

  return BTL_POINTS[position] ?? 0
}