'use client';
import React from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { MenuToggleIcon } from '@/components/ui/menu-toggle-icon';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import {
	NavigationMenu,
	NavigationMenuContent,
	NavigationMenuItem,
	NavigationMenuLink,
	NavigationMenuList,
	NavigationMenuTrigger,
} from '@/components/ui/navigation-menu';
import { 
    Bot, 
    PhoneOutgoing, 
    Workflow, 
    Database, 
    ShieldCheck, 
    FileText, 
    Star, 
    Users, 
    HelpCircle, 
    Leaf,
    RotateCcw,
    Shield,
    BarChart3,
    ArrowRight,
    MessageSquare,
    Zap
} from 'lucide-react';
import { LucideIcon } from 'lucide-react';

type LinkItem = {
	title: string;
	href: string;
	icon: React.ReactNode;
	description?: string;
	className?: string;
    isMobile?: boolean; // New prop for context safety
};

export function Header() {
	const [open, setOpen] = React.useState(false);
	const scrolled = useScroll(10);

	React.useEffect(() => {
		if (open) {
			document.body.style.overflow = 'hidden';
		} else {
			document.body.style.overflow = '';
		}
		return () => {
			document.body.style.overflow = '';
		};
	}, [open]);

	return (
		<header
			className={cn('fixed top-0 left-0 right-0 z-50 w-full transition-all duration-300 border-b border-transparent', {
				'bg-slate-950/80 border-white/5 backdrop-blur-md shadow-2xl py-0': scrolled,
                'bg-transparent py-2': !scrolled
			})}
		>
			<nav className="mx-auto flex h-20 w-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
				<div className="flex items-center gap-10">
					<Link href="/" className="flex items-center gap-2 group">
						<img src="/logo.jpeg" alt="VirtualCall.AI Logo" className="h-10 w-auto object-contain" />
					</Link>
					<NavigationMenu className="hidden md:flex">
						<NavigationMenuList>
							<NavigationMenuItem>
								<NavigationMenuTrigger className="bg-transparent text-slate-300 hover:text-white transition-colors uppercase font-bold text-xs">Product</NavigationMenuTrigger>
								<NavigationMenuContent className="bg-slate-950 border border-white/10 p-2 shadow-2xl min-w-[640px]">
									<div className="w-full p-6">
										<ul className="grid grid-cols-2 gap-6">
											{productItems.map((link, i) => (
												<ListItem key={i} {...link} />
											))}
										</ul>
										<div className="mt-4 p-4 border-t border-white/5 bg-white/5 rounded-b-xl">
											<p className="text-slate-400 text-sm">
												Beyond Basic Bots. {' '}
												<Link href="/contact" className="text-vc-cyan font-bold hover:underline inline-flex items-center">
													Schedule a demo <ArrowRight className="w-3 h-3 ml-1" />
												</Link>
											</p>
										</div>
									</div>
								</NavigationMenuContent>
							</NavigationMenuItem>
							<NavigationMenuItem>
								<NavigationMenuTrigger className="bg-transparent text-slate-300 hover:text-white transition-colors">Resources</NavigationMenuTrigger>
								<NavigationMenuContent className="bg-slate-950 border-white/10 p-2 shadow-2xl">
									<div className="grid w-[600px] grid-cols-2 gap-2">
										<ul className="space-y-1 p-2">
                                            <p className="text-[10px] uppercase font-black tracking-widest text-slate-500 mb-2 px-2">Case Studies</p>
											{companyLinks.map((item, i) => (
												<li key={i}>
													<ListItem {...item} />
												</li>
											))}
										</ul>
										<ul className="space-y-1 p-2 bg-white/5 rounded-md">
                                            <p className="text-[10px] uppercase font-black tracking-widest text-slate-500 mb-2 px-2">Platform</p>
											{companyLinks2.map((item, i) => (
												<li key={i}>
													<Link href={item.href} legacyBehavior passHref>
                                                        <NavigationMenuLink className="flex p-3 hover:bg-white/10 flex-row rounded-md items-center gap-x-3 group transition-colors">
														    {item.icon}
														    <span className="text-sm font-bold text-slate-200">{item.title}</span>
                                                        </NavigationMenuLink>
													</Link>
												</li>
											))}
										</ul>
									</div>
								</NavigationMenuContent>
							</NavigationMenuItem>
							<NavigationMenuItem>
                                <Link href="/solutions" legacyBehavior passHref>
                                    <NavigationMenuLink className="px-4 py-2 text-sm font-bold text-slate-300 hover:text-white transition-colors">
                                        Solutions
                                    </NavigationMenuLink>
                                </Link>
                            </NavigationMenuItem>
						</NavigationMenuList>
					</NavigationMenu>
				</div>

				<div className="hidden items-center gap-4 md:flex">
					<Link href="/login" className="text-sm font-bold text-slate-400 hover:text-white transition-colors">
                        Log In
                    </Link>
					<Button asChild className="bg-slate-800 hover:bg-slate-700 text-white rounded-full px-6 py-5 font-black text-xs uppercase tracking-widest transition-all shadow-lg shadow-slate-500/20 active:scale-95">
                        <Link href="/contact">Get a Demo</Link>
                    </Button>
				</div>

				<Button
					size="icon"
					variant="ghost"
					onClick={() => setOpen(!open)}
					className="md:hidden text-white hover:bg-white/10"
					aria-expanded={open}
					aria-controls="mobile-menu"
					aria-label="Toggle menu"
				>
					<MenuToggleIcon open={open} className="size-6" duration={300} />
				</Button>
			</nav>
			<MobileMenu open={open} className="flex flex-col justify-between gap-6 overflow-y-auto">
				<div className="flex w-full flex-col gap-y-6 pt-10">
                    <div>
						<p className="text-[10px] uppercase font-black tracking-widest text-slate-500 mb-4 px-2">Product</p>
                        <div className="grid gap-2">
                            {productItems.map((link) => (
                                <ListItem key={link.title} {...link} isMobile onClick={() => setOpen(false)} />
                            ))}
                        </div>
					</div>
					<div>
						<p className="text-[10px] uppercase font-black tracking-widest text-slate-500 mb-4 px-2">Case Studies & Platform</p>
						<div className="grid gap-2">
                            {companyLinks.map((link) => (
                                <ListItem key={link.title} {...link} isMobile onClick={() => setOpen(false)} />
                            ))}
                            {companyLinks2.map((link) => (
                                <ListItem key={link.title} {...link} isMobile onClick={() => setOpen(false)} />
                            ))}
                        </div>
					</div>
                    <div>
                        <p className="text-[10px] uppercase font-black tracking-widest text-slate-500 mb-4 px-2">Solutions</p>
                        <ul className="space-y-4 px-2">
                            <li><Link href="/contact" onClick={() => setOpen(false)} className="text-sm text-slate-200 hover:text-vc-cyan transition-colors">Customer Support</Link></li>
                            <li><Link href="/contact" onClick={() => setOpen(false)} className="text-sm text-slate-200 hover:text-vc-cyan transition-colors">Sales & Lead Gen</Link></li>
                            <li><Link href="/contact" onClick={() => setOpen(false)} className="text-sm text-slate-200 hover:text-vc-cyan transition-colors">Real Estate Scheduling</Link></li>
                            <li><Link href="/contact" onClick={() => setOpen(false)} className="text-sm text-slate-200 hover:text-vc-cyan transition-colors">Medical Reminders</Link></li>
                        </ul>
                    </div>
				</div>
				<div className="flex flex-col gap-3 pb-10">
					<Button asChild variant="outline" className="w-full bg-transparent border-white/10 text-white hover:bg-white/5 rounded-full py-6">
						<Link href="/login" onClick={() => setOpen(false)}>Sign In</Link>
					</Button>
					<Button asChild className="w-full bg-slate-800 hover:bg-slate-700 text-white rounded-full py-6 font-black uppercase tracking-widest text-xs">
						<Link href="/contact" onClick={() => setOpen(false)}>Get Started</Link>
					</Button>
				</div>
			</MobileMenu>
		</header>
	);
}

type MobileMenuProps = React.ComponentProps<'div'> & {
	open: boolean;
};

function MobileMenu({ open, children, className, ...props }: MobileMenuProps) {
	const [mounted, setMounted] = React.useState(false);

	React.useEffect(() => {
		setMounted(true);
	}, []);

	if (!mounted) return null;

	return createPortal(
		<div
			id="mobile-menu"
			className={cn(
				'bg-slate-950 fixed top-20 right-0 bottom-0 left-0 z-40 flex flex-col overflow-hidden md:hidden',
                !open && 'hidden'
			)}
		>
			<div
				data-slot={open ? 'open' : 'closed'}
				className={cn(
					'data-[slot=open]:animate-in data-[slot=open]:fade-in data-[slot=open]:slide-in-from-top-4 ease-out',
					'size-full p-6',
					className,
				)}
				{...props}
			>
				{children}
			</div>
		</div>,
		document.body,
	);
}

const ListItem = React.memo(({
	title,
	description,
	icon: Icon,
	className,
	href,
    isMobile = false,
    onClick,
}: LinkItem & { onClick?: () => void }) => {
    const content = (
        <div
            className={cn(
                'w-full flex flex-row gap-x-4 items-center rounded-xl p-3 transition-all hover:bg-white/5 group', 
                className
            )} 
        >
            <div className="bg-green-500/10 flex aspect-square size-10 items-center justify-center rounded-lg border border-green-500/20 group-hover:border-green-500/40 group-hover:bg-green-500/20 transition-all text-vc-cyan">
                {Icon}
            </div>
            <div className="flex flex-col items-start justify-center">
                <span className="text-sm font-bold text-slate-200 group-hover:text-white transition-colors">{title}</span>
                <span className="text-slate-500 text-xs line-clamp-1 leading-relaxed">{description}</span>
            </div>
        </div>
    );

	return (
        <li>
            <Link 
                href={href}
                legacyBehavior
                passHref
            >
                {isMobile ? (
                    <a className="block" onClick={onClick}>{content}</a>
                ) : (
                    <NavigationMenuLink asChild>
                        {content}
                    </NavigationMenuLink>
                )}
            </Link>
        </li>
	);
});

ListItem.displayName = 'ListItem';

const productItems: LinkItem[] = [
	{
		title: 'What we offer',
		description: 'A comprehensive view of our AI voice infrastructure.',
		href: '/products/what-we-offer',
		icon: <Bot className="w-5 h-5 text-green-500" />,
	},
	{
		title: 'Inbound Agents',
		description: '24/7 intelligent customer support solutions.',
		href: '/products/inbound',
		icon: <MessageSquare className="w-5 h-5 text-indigo-500" />,
	},
	{
		title: 'Outbound Dialer',
		description: 'High-volume lead generation and scheduling.',
		href: '/products/outbound',
		icon: <PhoneOutgoing className="w-5 h-5 text-emerald-500" />,
	},
	{
		title: 'Live Call Transfers',
		description: 'Seamless AI-to-human bridge technology.',
		href: '/products/transfers',
		icon: <Zap className="w-5 h-5 text-amber-500" />,
	},
	{
		title: 'CRM Integrations',
		description: 'Native sync with HubSpot, Salesforce, and more.',
		href: '/products/integrations',
		icon: <Database className="w-5 h-5 text-purple-500" />,
	},
];

const companyLinks: LinkItem[] = [
	{
		title: 'ShipSearch',
		href: '/case-studies/shipsearch',
		description: 'Scale in logistics outreach',
		icon: <Star className="size-5" />,
	},
	{
		title: 'Mustang LS',
		href: '/case-studies/mustang-ls',
		description: 'Real Estate lead qualification',
		icon: <Users className="size-5" />,
	},
];

const companyLinks2: LinkItem[] = [
    {
		title: 'Security & Trust',
		href: '/security',
		icon: <ShieldCheck className="size-4" />,
	},
	{
		title: 'Privacy Policy',
		href: '/privacy',
		icon: <Shield className="size-4" />,
	},
	{
		title: 'Blog',
		href: '/blog',
		icon: <Leaf className="size-4" />,
	},
	{
		title: 'Help Center',
		href: '/help',
		icon: <HelpCircle className="size-4" />,
	},
];


function useScroll(threshold: number) {
	const [scrolled, setScrolled] = React.useState(false);

	const onScroll = React.useCallback(() => {
		setScrolled(window.scrollY > threshold);
	}, [threshold]);

	React.useEffect(() => {
		window.addEventListener('scroll', onScroll);
		return () => window.removeEventListener('scroll', onScroll);
	}, [onScroll]);

	React.useEffect(() => {
		onScroll();
	}, [onScroll]);

	return scrolled;
}
