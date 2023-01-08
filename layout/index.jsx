import React from 'react'
import Link from 'next/link'

export default function H({ children }) {
    return (
        <div>
            <div>
                <Link href='/'>Home</Link>
                <Link href='/contact'>Contact</Link>
            </div>
            <div>{children}</div>
            <div>footerer</div>
        </div>
    )
}
