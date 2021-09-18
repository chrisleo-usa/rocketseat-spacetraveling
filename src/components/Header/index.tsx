import Link from 'next/link'

import styles from './header.module.scss'

export default function Header() {
  return (
    <header className={styles.headerContainer}>
      <div className={styles.headerContent}>
        <h1>
          <Link href='/'>
            <a>
              <img src="/images/Logo.svg" alt="logo" />
            </a>
          </Link>
        </h1>
      </div>
    </header>
  )
}
