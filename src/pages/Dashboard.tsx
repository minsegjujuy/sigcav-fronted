import { Drawer } from "@mui/material"
import { useState } from "react"
import NavListDrawer from "../components/NavListDrawer"

const Dashboard = () => {
  const [open, setOpen] = useState(false)
  return (
    <>
      <button onClick={()=> setOpen(true)}>Menu</button>
      <Drawer open={open} anchor="bottom" onClose={()=> setOpen(false)}>
        <NavListDrawer />
      </Drawer>
    </>
  )
}

export default Dashboard