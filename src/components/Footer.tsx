import styles from '@/styles/components/Footer.module.css'

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <p className={styles.text}>
        © {new Date().getFullYear()} <span className={styles.accent}>INDUSPHERE</span> — All rights reserved
      </p>
    </footer>
  )
}