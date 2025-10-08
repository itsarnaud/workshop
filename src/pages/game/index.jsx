import { getRole } from "@/lib/auth"

export default function Game() {
  const role = getRole();

  return(
    <div>
      <h1>Vous êtes {role}</h1>
    </div>
  )
}

