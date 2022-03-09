import { Paper, styled, Theme } from "@mui/material"
import { ToastBar } from "react-hot-toast"
import React from "react"

type Props = React.ComponentProps<typeof ToastBar> & React.ComponentProps<typeof Paper>

const CustomToast = ({ ...props }: Props) => <CustomPaper {...props} />

const CustomPaper = styled<typeof Paper>(Paper)``

export default CustomToast
